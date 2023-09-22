import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from './master';
import HomeMenu from './dashboard/homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogActions, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../utils/db';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import WorkIcon from '@mui/icons-material/Work';
import { SnackbarProvider, VariantType, useSnackbar, enqueueSnackbar } from 'notistack';
import { createStyles, FormControlLabel, FormLabel, Radio, RadioGroup, Theme, withStyles } from '@material-ui/core';
import { WithStyles } from '@material-ui/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

export default function notification(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 250 },
    {
      field: 'Category',
      headerName: 'Category',
      width: 200,
      editable: true,
    },
    {
      field: 'Notification',
      headerName: 'Notification',
      width: 320,
      editable: true,
    },
    {
      field: 'Date',
      headerName: 'Date',
      width: 200,
      editable: true,
    },
    {
      field: 'action1',
      headerName: '',
      width: 200,
      renderCell: (params) => {
      
        const [open, setOpen] = React.useState(false);
        const [selectedValue, setSelectedValue] = React.useState();

        const handleClose = async () => {
          setOpen(false);
        };
        
        const handleClick = async () => {
            setSelectedRow(params.row)
            setOpen(true);
        };

        const handleDeleteNotif = async () => {    
          if(params.row.id){
            try {
                const docRef = doc(db, 'notification', params.row.id);
                await deleteDoc(docRef);
                enqueueSnackbar('Success Delete Notification!', { variant: 'success' });    
                setOpen(false);
                setRefreshList(true)
              } catch (error) {
                console.error('Error deleting document:', error);
              }
          }  
        };

        return (
          <div>
            <Button variant="contained" color="primary" onClick={handleClick} style={{ backgroundColor: 'red' }}>
                Delete
            </Button>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle id="customized-dialog-title">
              Delete Notification
            </DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom>
                  Do you want to delete this notification?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
                Close
              </Button>
              <Button onClick={handleDeleteNotif} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
              Delete
              </Button>
            </DialogActions>
          </Dialog>
          </div>
          
        );
      },
    },
  ];

  useEffect(() => {    
    const storedId = localStorage.getItem('id');

    // Define a function to fetch the data from Firestore
    const fetchData = async () => { 
      const collectionRef = collection(db, 'notification');

      try {
        const querySnapshot = await getDocs(collectionRef);

        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      })).filter((item) => item.data.staff === storedId);
        setData(fetchedData);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('id');

    // Define a function to fetch the data from Firestore
    if(refreshList){
      const fetchData = async () => { 
        const collectionRef = collection(db, 'notification');
  
        try {
          const querySnapshot = await getDocs(collectionRef);
  
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        })).filter((item) => item.data.staff === storedId);
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
                    Notification List
                </Typography>
                <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data.map((user) => ({
                    id: user.id,
                    Category: user.data.category,
                    Notification: user.data.name,
                    Date: user.data.date,
                }))}
                    columns={columns}
                />
                </div>
            </HomeMenu>
        </SnackbarProvider>
    );
}