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

async function insertCertificate(type: string, patient: string, createdDate: string, gender: string, dob: string, address: string, status: string){
    const staffRef = collection(db, "certificate");
    await setDoc(doc(staffRef), {
      type: type, patient: patient, createdDate: createdDate, gender: gender, dob: dob, address: address, status: status});
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
    };
  
    return (
        <Dialog onClose={handleCloseDialog} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title">
          Approve Certificate
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
              Do you want to approve this certificate?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Close
          </Button>
          <Button onClick={handleRemoveStatus} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
          Approve
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

export default function certificate(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({ patient: "", createdDate: "", gender: "", dob: "", address: "", type: "", status: "" });
    const [errorUpdate, setErrorUpdate] = useState({ patient: "", createdDate: "", gender: "", dob: "", address: "", type: "", status: "" });
    const [patient, setPatient] = useState("");
    const [type, setType] = useState("");
    const [dropdownDataPatient, setDropdownDataPatient] = useState([]);
    const [createdDate, setCreatedDate] = useState(null);
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState(null);

    const handleChangeType = (event) => {
      setType(event.target.value);
    };

    const handleChangePatient = (event) => {
      setPatient(event.target.value);
    };

    const handleCreatedDateChange = (date) => {
      setCreatedDate(date.target.value);
    };

    const handleChangeGender = (event) => {
      setGender(event.target.value);
    };

    const handleDobChange = (date) => {
      setDob(date.target.value);
    };

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const handleClose = () => {
        setError({ patient: "", createdDate: "", gender: "", dob: "", address: "", type: "", status: "" })
        setOpen(false);
        setType('')
        setPatient('')
        setCreatedDate('')
        setGender('')
        setDob('')
    };

    useEffect(() => {
      const fetchData = async () => {
        const collectionRef = collection(db, 'patients');
    
        try {
          const querySnapshot = await getDocs(collectionRef);
          const data = querySnapshot.docs.map((doc) => doc.data());
          setDropdownDataPatient(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
    }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 200 },
    {
      field: 'Patient',
      headerName: 'Patient',
      width: 200,
      editable: true,
    },
    {
      field: 'CreatedDate',
      headerName: 'Created Date',
      width: 130,
      editable: true,
    },
    {
        field: 'Gender',
        headerName: 'Gender',
        width: 120,
        editable: true,
    },
    {
        field: 'DOB',
        headerName: 'DOB',
        width: 120,
        editable: true,
    },
    {
        field: 'Address',
        headerName: 'Address',
        width: 300,
        editable: true,
    },
    {
        field: 'Type',
        headerName: 'Type',
        width: 120,
        editable: true,
    },
    {
        field: 'action1',
        headerName: '',
        width: 120,
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
  
          if(params.row.Status == "Approved" || role != "Doctor"){
              return null
          }
  
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
      const collectionRef = collection(db, 'certificate');

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
        const collectionRef = collection(db, 'certificate');
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

  const handleCloseRequest = (address: string) => {
    let isValid = true;
    let errors = { patient: "", createdDate: "", gender: "", dob: "", address: "", type: "", status: "" };

    if (type.trim().length < 1) {
      isValid = false;
      errors.type = "Type must be filled.";
    }
    if (patient.trim().length < 1) {
        isValid = false;
        errors.patient = "Patient Name must be filled.";
    }
    if(!createdDate){
      isValid = false;
      errors.createdDate = "Created Date must be filled.";
    }
    if (gender.trim().length < 1) {
      isValid = false;
      errors.gender = "Gender must be filled.";
    }
    if(!dob){
      isValid = false;
      errors.dob = "DOB must be filled.";
    }
    if (address.trim().length < 1) {
      isValid = false;
      errors.address = "Address must be filled.";
    }

    setError(errors);

    if(isValid){
        setOpen(false);
        insertCertificate(type, patient, createdDate, gender, dob, address, "Pending");
        enqueueSnackbar('Success Request Certificate!', { variant: 'success' });   
        setType('')
        setPatient('')
        setCreatedDate('')
        setGender('')
        setDob('') 
        setRefreshList(true)
      }
  };

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Certificate List
                </Typography>
                <Box marginTop={2} marginBottom={3} width={300}>
                  <div>
                    {(role === "Administration Staff" || role === "Nurse") && (
                      <Button variant="contained" color="primary" onClick={handleAddNewMedicine} fullWidth>
                        Request Certificate
                      </Button>
                    )}
                  </div>
                </Box>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    New Certificate
                </DialogTitle>
                <DialogContent>
                        <FormControl fullWidth required margin="normal"
                            error={error.type.length > 0}
                            >
                            <InputLabel>Certificate Type</InputLabel>
                            <Select labelId="CertificateType" id="CertificateType" label="Certificate Type" value={type} onChange={handleChangeType}>                             
                                    <MenuItem key="Birth" value="Birth">Birth</MenuItem>
                                    <MenuItem key="Death" value="Death">Death</MenuItem>
                            </Select>
                        {error.type && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.type}</div>}
                        </FormControl>
                          <FormControl fullWidth required margin="normal"
                              error={error.patient.length > 0}
                              >
                              <InputLabel>Patient Name</InputLabel>
                              <Select labelId="patient" id="patient" label="Patient Name" value={patient} onChange={handleChangePatient}>
                                  {dropdownDataPatient.map((item) => (
                                      <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                  ))}
                              </Select>
                          {error.patient && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.patient}</div>}
                          </FormControl>
                          <TextField
                            id="createdDate"
                            label="Created Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            style={{ marginTop: '16px' }}
                            value={createdDate}
                            onChange={handleCreatedDateChange}
                            helperText={error.createdDate}
                            error={error.createdDate.length > 0}
                            />
                            <FormControl fullWidth required margin="normal"
                                error={error.gender.length > 0}
                                >
                                <InputLabel>Gender</InputLabel>
                                <Select labelId="Gender" id="Gender" label="Gender" value={gender} onChange={handleChangeGender}>                             
                                        <MenuItem key="Male" value="Male">Male</MenuItem>
                                        <MenuItem key="Female" value="Female">Female</MenuItem>
                                </Select>
                            {error.gender && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.gender}</div>}
                            </FormControl>
                            <TextField
                            id="dob"
                            label="DOB"
                            type="date"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            style={{ marginTop: '16px' }}
                            value={dob}
                            onChange={handleDobChange}
                            helperText={error.dob}
                            error={error.dob.length > 0}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="address"
                                label="Address"
                                name="address"
                                // value={id}
                                // onChange={(e) => setId(e.target.value)}
                                helperText={error.address}
                                error={error.address.length > 0}
                            />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseRequest((document.getElementById("address") as HTMLInputElement).value)}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Request
                    </Button>
                </DialogActions>
                </Dialog>
                <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={data.map((user) => ({
                    id: user.id,
                    Patient: user.data.patient,
                    CreatedDate: user.data.createdDate,
                    Gender: user.data.gender,
                    DOB: user.data.dob,
                    Address: user.data.address,
                    Type: user.data.type,
                    Status: user.data.status
                    }))}
                    columns={columns}
                />
                </div>
            </HomeMenu>
        </SnackbarProvider>
    );
}