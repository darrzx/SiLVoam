import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogContent, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../utils/db';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import WorkIcon from '@mui/icons-material/Work';
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';

export interface SimpleDialogProps {
    open: boolean;
    selectedValue: string;
    param: any;
    setRefreshList: any;
    onClose: (value: string) => void;
  }
  
  function SimpleDialog(props: SimpleDialogProps) {
    const { enqueueSnackbar } = useSnackbar();

    const [roles, setRoles] = useState([]);
    const { onClose, selectedValue, open, param, setRefreshList } = props;
  
    useEffect(() => {
      // Define a function to fetch the data from Firestore
      const fetchShift = async () => {
        const collectionRef = collection(db, 'roles');
  
        try {
          const querySnapshot = await getDocs(collectionRef);
  
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
        setRoles(fetchedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
      };
  
      fetchShift();
    }, []);
  
    const handleListItemClick = async (newRole: string) => {
      onClose(selectedValue);
  
      console.log(param)
      const { id, shift, email, role } = param;
      const collectionRef = collection(db, 'users');
      const snapshot = await getDocs(collectionRef);
      
      snapshot.forEach(async (document)  => {
        if(document.id == id){
          const updatedData = {
            role: newRole,
        };
        
            const userDocRef = doc(getFirestore(), 'users', id);
            await updateDoc(userDocRef, updatedData);
            enqueueSnackbar('Success Update Role!', { variant: 'success' });
            setRefreshList(true);
        }
      });
    };
  
    const handleCloseDialog = () => {
      onClose(selectedValue);
    };
  
    return (
      <Dialog onClose={handleCloseDialog} aria-labelledby="simple-dialog-title" open={open}>
        <DialogContent>
              <div>
                <DialogTitle id="simple-dialog-title">Update Staff Role</DialogTitle>
                <List>
                <Divider />
                {roles.map((role, index) => (
                  <React.Fragment key={role.id}>
                    <ListItem button onClick={() => handleListItemClick(role.data.name)} key={role.data.name}>
                      <ListItemAvatar>
                        <Avatar>
                          <WorkIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <Typography paragraph>
                      <ListItemText primary={role.data.name} />
                      </Typography>        
                    </ListItem>
                    <Divider />                  
                    </React.Fragment>
                   
                  ))}
                </List>
              </div>
        </DialogContent>
      </Dialog>
    );
  }

export default function manageStaff(){
    const { enqueueSnackbar } = useSnackbar();
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [ notifOpen, setNotifOpen ] = useState(false);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'UID', width: 280 },
    {
      field: 'Email',
      headerName: 'Email',
      width: 200,
      editable: true,
    },
    {
      field: 'Name',
      headerName: 'Name',
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
        field: 'Shift',
        headerName: 'Shift',
        width: 200,
        editable: true,
      },
    {
      field: 'action1',
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

        if(params.row.Role === "Administration Staff"){
          return null;
        }


        return (
          <div>
          <Button variant="contained" color="primary" onClick={handleClick}>
              Update
          </Button>
          <SimpleDialog setRefreshList={setRefreshList} param={params.row} selectedValue={selectedValue} open={open} onClose={handleClose} />
          </div>
          
        );
      },
    },
    {
        field: 'action2',
        headerName: '',
        width: 150,
        renderCell: (params) => {          
          const handleClickDelete = async () => {
            const collectionRef = collection(db, 'users');
            const snapshot = await getDocs(collectionRef);

            snapshot.forEach(async (document)  => {
                console.log(document.id)
                if(document.id == params.row.id){
                    const userReqDocRef = doc(getFirestore(), 'users', document.id);
                    await deleteDoc(userReqDocRef);  
                    setNotifOpen(true);
                    setRefreshList(true);
                }
            }); 
          };
  
        if(params.row.Role === "Administration Staff"){
          return null;
        }

          return (
            <div>
            <Button variant="contained" color="error" onClick={handleClickDelete}>
                Delete
            </Button>
            </div>
            
          );
        },
      },
  ];

  useEffect(() => {
    // Define a function to fetch the data from Firestore
    const fetchData = async () => {
      const collectionRef = collection(db, 'users');

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
        const collectionRef = collection(db, 'users');
  
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

  useEffect(() => {
    // Define a function to fetch the data from Firestore
    if(notifOpen){
        enqueueSnackbar('Success Delete Staff!', { variant: 'success' });
        setNotifOpen(false)
    }
  }, [notifOpen]);

    return (
        <SnackbarProvider maxSnack={1}>
        <HomeMenu>
            <Typography variant="h4" gutterBottom>
                All Staff List
            </Typography>
            
            <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={data.map((user) => ({
                  id: user.id,
                  Email: user.data.email,
                  Name: user.data.name,
                  Role: user.data.role,
                  Shift: user.data.shift
              }))}
                columns={columns}
            />
            </div>
        </HomeMenu>
        </SnackbarProvider>
    );
}