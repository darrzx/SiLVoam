import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../utils/db';
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

async function insertMedicine(name: string, price: string, stock: number){
    const staffRef = collection(db, "medicine");
    await setDoc(doc(staffRef), {
        name: name, price: price, stock: stock});
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

  const DialogActions = withStyles((theme: Theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(1),
    },
  }))(MuiDialogActions);

  export interface SimpleDialogProps {
    open: boolean;
    selectedValue: string;
    param: any;
    setRefreshList: any;
    onClose: (value: string) => void;
  }
  
  function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, selectedValue, open, param, setRefreshList } = props;
    
    const handleCloseDialog = () => {
      onClose(selectedValue);
    };

    const handleRemoveStatus = async () => {
      onClose(selectedValue);
  
      console.log(param)
      const { id, MedicineName, Price, Stock } = param;
      const collectionRef = collection(db, 'medicine');
      const snapshot = await getDocs(collectionRef);
      
      snapshot.forEach(async (document)  => {
        if(document.id == id){
            const docRef = doc(db, 'medicine', id);
            await deleteDoc(docRef); 

            enqueueSnackbar('Success Remove Medicine!', { variant: 'success' });
            setRefreshList(true);
        }
      });
    };
  
    return (
        <Dialog onClose={handleCloseDialog} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title">
          Remove Medicine
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
              Do you want to remove this medicine?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Close
          </Button>
          <Button onClick={handleRemoveStatus} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
          Remove
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

export default function medicine(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({ name: "", price: "", stock: "" });
    const [errorUpdate, setErrorUpdate] = useState({ name: "", price: "", stock: "" });
    const [patient, setPatient] = useState("");
    const [driver, setDriver] = useState("");


    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const handleClose = () => {
        setError({ name: "", price: "", stock: "" })
        setOpen(false);
    };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 280 },
    {
      field: 'MedicineName',
      headerName: 'Medicine Name',
      width: 200,
      editable: true,
    },
    {
      field: 'Price',
      headerName: 'Price',
      width: 200,
      editable: true,
    },
    {
        field: 'Stock',
        headerName: 'Stock',
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
  
          const handleClose = async () => {
            setOpen(false);
          };
          
          const handleClick = async () => {
              setSelectedRow(params.row)
              setOpen(true);
          };

          const handleCloseUpdate = async (name: string, price: string, stock: number) => {
            let isValid = true;
            let errors = { name: "", price: "", stock: "" };
        
            if (name.trim().length < 1) {
                isValid = false;
                errors.name = "Medicine Name must be filled.";
            }
            if (price.trim().length < 1) {
                isValid = false;
                errors.price = "Price must be filled.";
            }
            if (!stock) {
                isValid = false;
                errors.stock = "Stock must be filled.";
            }
            setErrorUpdate(errors);
        
            if(isValid){
                setOpen(false);
                const collectionRef = collection(db, 'medicine');
                const snapshot = await getDocs(collectionRef);
                
                snapshot.forEach(async (document)  => {
                    if(document.id == params.row.id){
                    const updatedData = {
                        name: name,
                        price: price,
                        stock: stock
                    };
                    
                        const userDocRef = doc(getFirestore(), 'medicine', params.row.id);
                        await updateDoc(userDocRef, updatedData);
                        enqueueSnackbar('Success Update Medicine!', { variant: 'success' });    
                    }
                });
                setRefreshList(true)
              }
          };

          return (
            <div>
            <Button variant="contained" color="primary" onClick={handleClick}>
                Update
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    Update Medicine
                </DialogTitle>
                <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Medicine Name"
                            name="name"
                            autoFocus
                            helperText={errorUpdate.name}
                            error={errorUpdate.name.length > 0}
                            // value={name}
                            // onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            id="price"
                            label="Price"
                            name="name"
                            required
                            fullWidth
                            helperText={errorUpdate.price}
                            error={errorUpdate.price.length > 0}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            id="stock"
                            label="Stock"
                            type="number"
                            required
                            fullWidth
                            inputProps={{
                                min: 1,
                                max: 100,
                                step: 1
                            }}
                            helperText={errorUpdate.stock}
                            error={errorUpdate.stock.length > 0}
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseUpdate((document.getElementById("name") as HTMLInputElement).value, 
                            (document.getElementById("price") as HTMLInputElement).value,
                            parseInt((document.getElementById("stock") as HTMLInputElement).value))}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Update
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
            
          );
        },
    },
    {
        field: 'action2',
        headerName: '',
        width: 150,
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

          return (
            <div>
            <Button variant="contained" color="error" onClick={handleClick}>
                Remove
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
      const collectionRef = collection(db, 'medicine');

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
        const collectionRef = collection(db, 'medicine');
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

  const handleAddNewMedicine = () => {
    setOpen(true);
  };

  const handleCloseAdd = (name: string, price: string, stock: number) => {
    let isValid = true;
    let errors = { name: "", price: "", stock: "" };

    if (name.trim().length < 1) {
        isValid = false;
        errors.name = "Medicine Name must be filled.";
    }
    if (price.trim().length < 1) {
        isValid = false;
        errors.price = "Price must be filled.";
    }
    if (!stock) {
        isValid = false;
        errors.stock = "Stock must be filled.";
    }
    setError(errors);

    if(isValid){
        setOpen(false);
        insertMedicine(name, price, stock);
        enqueueSnackbar('Success Add New Medicine!', { variant: 'success' });    
        setRefreshList(true)
      }
  };

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Medicine List
                </Typography>
                <Box marginTop={2} marginBottom={3} width={300}>
                    <Button variant="contained" color="primary" onClick={handleAddNewMedicine} fullWidth>
                       Add New Medicine
                    </Button>
                </Box>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    New Medicine
                </DialogTitle>
                <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Medicine Name"
                            name="name"
                            autoFocus
                            helperText={error.name}
                            error={error.name.length > 0}
                            // value={name}
                            // onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            id="price"
                            label="Price"
                            name="name"
                            required
                            fullWidth
                            helperText={error.price}
                            error={error.price.length > 0}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            id="stock"
                            label="Stock"
                            type="number"
                            required
                            fullWidth
                            inputProps={{
                                min: 1,
                                max: 100,
                                step: 1
                            }}
                            helperText={error.stock}
                            error={error.stock.length > 0}
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseAdd((document.getElementById("name") as HTMLInputElement).value, 
                            (document.getElementById("price") as HTMLInputElement).value,
                            parseInt((document.getElementById("stock") as HTMLInputElement).value))}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Add
                    </Button>
                </DialogActions>
                </Dialog>
                <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={data.map((user) => ({
                    id: user.id,
                    MedicineName: user.data.name,
                    Price: user.data.price,
                    Stock: user.data.stock,
                    }))}
                    columns={columns}
                />
                </div>
            </HomeMenu>
        </SnackbarProvider>
    );
}