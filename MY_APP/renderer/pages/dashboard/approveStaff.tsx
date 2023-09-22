import React, { useState } from 'react';
import { getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import Typography from '@mui/material/Typography';
import HomeMenu from './homeMenu';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { auth, db } from '../../utils/db';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import Head from 'next/head';
import { Avatar, Button, Dialog, DialogContent, DialogTitle, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "firebase/auth";
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  param: any;
  setRefreshList: any;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const [shifts, setShifts] = useState([]);
  const { onClose, selectedValue, open, param, setRefreshList } = props;
  const [showSecondContent, setShowSecondContent] = useState(false);
  const [users, setUsers] = useState([])
  const [currentShift, setCurrentShift] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Define a function to fetch the data from Firestore
    const fetchShift = async () => {
      const collectionRef = collection(db, 'shifts');

      try {
        const querySnapshot = await getDocs(collectionRef);

        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      }));
      setShifts(fetchedData);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
    };

    fetchShift();
  }, []);

  const handleClose = async () => {
    onClose(selectedValue);
    setShowSecondContent(false);

    console.log(param)
    const { id, name, email, role } = param;
    const collectionRef = collection(db, 'registerrequest');
    const snapshot = await getDocs(collectionRef);
    
    snapshot.forEach(async (document)  => {
      if(document.id == id){
        const { email, name, password, role } = document.data();
        createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const data = {
            name: name,
            email: email,
            password: password,
            shift: currentShift,
            role: role
          };
      
          const userDocRef = doc(getFirestore(), 'users', userCredential.user.uid);
          await setDoc(userDocRef, data);

          const userReqDocRef = doc(getFirestore(), 'registerrequest', id);
          await deleteDoc(userReqDocRef);  
        
          enqueueSnackbar('Success Approve New Staff!', { variant: 'success' });

          setRefreshList(true);
      })
      }
    });
  };

  const handleListItemClick = async (currShift: string) => {
    setCurrentShift(currShift);
    // Define a function to fetch the data from Firestore
    const collectionRef = collection(db, 'users');

    try {
      const querySnapshot = await getDocs(collectionRef);

      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
    })).filter((user) => user.data.shift === currShift);
    console.log(fetchedData);
    setUsers(fetchedData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    setShowSecondContent(true);
  };

  const handleBackButtonClick = () => {
    setShowSecondContent(false);
    setCurrentValue('');
  };

  const handleCloseDialog = () => {
    onClose(selectedValue);
    setShowSecondContent(false);
  };

  return (
    <Dialog onClose={handleCloseDialog} aria-labelledby="simple-dialog-title" open={open}>
      <DialogContent>
          {showSecondContent ? (
            <div>
            <DialogTitle id="simple-dialog-title">Staff with {currentShift} shift</DialogTitle>
            <Divider />
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem button>
                  <ListItemText primary={ <Typography variant="body2">
                                          Name: {user.data.name}
                                          <br />
                                          Role: {user.data.role}
                                        </Typography> }/>
                </ListItem>
                <Divider />
                </React.Fragment>
              ))}
            <Button onClick={handleBackButtonClick} style={{ marginTop: '14px' }}>Back</Button>
            <Button onClick={handleClose} color="primary" style={{ marginTop: '14px' }}>
              Assign
            </Button>
          </div>
          ) : (
            <div>
              <DialogTitle id="simple-dialog-title">Assign Staff Shift</DialogTitle>
              <List>
              <Divider />
              {shifts.map((shift, index) => (
                <React.Fragment key={shift.id}>
                  <ListItem button onClick={() => handleListItemClick(shift.data.name)} key={shift.data.name}>
                    <ListItemAvatar>
                      <Avatar>
                        <QueryBuilderIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <Typography paragraph>
                    <ListItemText primary={shift.data.name + " (" + shift.data.startHour + ":00 - " + shift.data.endHour + ":00)"} />
                    </Typography>        
                  </ListItem>
                  <Divider />                  
                  </React.Fragment>
                ))}
              </List>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}

export default function approveStaff(){
  const [ refreshList, setRefreshList ] = useState(false);
  const [data, setData] = useState([]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 250 },
    {
      field: 'Name',
      headerName: 'Name',
      width: 200,
      editable: true,
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 200,
      editable: true,
    },
    {
      field: 'Role',
      headerName: 'Role',
      width: 200,
      editable: true,
    },
    {
      field: 'actions',
      headerName: '',
      width: 150,
      renderCell: (params) => {
      
        const [open, setOpen] = React.useState(false);
        const [selectedValue, setSelectedValue] = React.useState();
        const [data, setData] = useState([]);

        const handleClose = async () => {
          setOpen(false);
        };
        
        const handleClick = async () => {
          console.log(params.row)
          setOpen(true);
        };

        return (
          <div>
          <Button variant="contained" color="primary" onClick={handleClick}>
              Approve
          </Button>
          <SimpleDialog setRefreshList={setRefreshList} param={params.row} selectedValue={selectedValue} open={open} onClose={handleClose} />
          </div>
          
        );
      },
    },
  ];

  useEffect(() => {
    // Define a function to fetch the data from Firestore
    const fetchData = async () => {
      const collectionRef = collection(db, 'registerrequest');

      try {
        const querySnapshot = await getDocs(collectionRef);

        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      }));
        setData(fetchedData);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Define a function to fetch the data from Firestore
    if(refreshList){
      const fetchData = async () => {
        const collectionRef = collection(db, 'registerrequest');
  
        try {
          const querySnapshot = await getDocs(collectionRef);
  
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
          setData(fetchedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
      };

      fetchData();
      setRefreshList(false)
    }
  }, [refreshList]);

    return (
      <SnackbarProvider maxSnack={1}>
        <HomeMenu>
            <Typography variant="h4" gutterBottom>
                Register New Staff List
            </Typography>

            <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={data.map((user) => ({
                  id: user.id,
                  Name: user.data.name,
                  Email: user.data.email,
                  Role: user.data.role,
              }))}
                columns={columns}
            />
            </div>
        </HomeMenu>
        </SnackbarProvider>
    );
}
