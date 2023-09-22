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

async function insertAmbulance(type: string, year: string, policeNumber: string, status: string){
    const staffRef = collection(db, "ambulances");
    await setDoc(doc(staffRef), {
        type: type, year: year, policeNumber: policeNumber, status: status});
}

async function insertJob(name: string, staff: string, patient: string, assignedDate: string, dueDate: string, room: string, bed: string, category: string, status: string){
  const staffRef = collection(db, "job");
  await setDoc(doc(staffRef), {
    name: name, staff: staff, patient: patient, assignedDate: assignedDate, dueDate: dueDate, room: room, bed: bed, category: category, status: status });
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

    const { id, Job, Staff, AssignedDate, Category, DueDate, Patient ,Room, Status } = param;

    const handleCloseDialog = () => {
      onClose(selectedValue);
    };

    const handleBanStatus = async () => {
      onClose(selectedValue);
  
      console.log(param)
      const { id, shift, email, role } = param;
      const collectionRef = collection(db, 'ambulances');
      const snapshot = await getDocs(collectionRef);
      
      snapshot.forEach(async (document)  => {
        if(document.id == id){
          const updatedData = {
            status: "Unusable",
        };
        
            const userDocRef = doc(getFirestore(), 'ambulances', id);
            await updateDoc(userDocRef, updatedData);
            enqueueSnackbar('Success Ban Ambulance!', { variant: 'success' });
            setRefreshList(true);
        }
      });
    };
  
    return (
        <Dialog onClose={handleCloseDialog} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title">
          Ban Ambulance
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
              Do you want to ban this ambulance?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Close
          </Button>
          <Button onClick={handleBanStatus} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
            Ban
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

export default function manageAmbulance(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [dataRoom, setDataRoom] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({ type: "", year: "", policeNumber: "" });
    const [errorUse, setErrorUse] = useState({ destination: "", patient: "", driver: "" });
    const [dropdownData, setDropdownData] = useState([]);
    const [dropdownDataPatient, setDropdownDataPatient] = useState([]);
    const [dropdownDataDriver, setDropdownDataDriver] = useState([]);
    const [patient, setPatient] = useState("");
    const [driver, setDriver] = useState("");
    const [isBedLeft, setIsBedLeft] = useState(false);
    const [ambulanceId, setAmbulanceId] = useState("");
    const [bedToBeStored, setBedToBeStored] = useState("");
    const [roomToBeStored, setRoomToBeStored] = useState("");
    const [bedIdToBeStored, setBedIdToBeStored] = useState("");
    const [patientIdToBeStored, setPatientIdToBeStored] = useState("");

    useEffect(() => {
      const fetchData = async () => {
        const collectionRef = collection(db, 'patients');
    
        try {
          const querySnapshot = await getDocs(collectionRef);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          setDropdownDataPatient(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        const collectionRef = collection(db, 'users');
        
        try {
          const querySnapshot = await getDocs(query(collectionRef, where('role', '==', 'Ambulance Driver')));
          const data = querySnapshot.docs.map((doc) => doc.data());
          setDropdownDataDriver(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      
      fetchData();
    }, []);    

    const handleChange = (event) => {
        setPatient(event.target.value);
        const selectedPatient = dropdownDataPatient.find(
          (item) => item.data.name === event.target.value
        );
      
        const selectedPatientId = selectedPatient ? selectedPatient.id : null;
        setPatientIdToBeStored(selectedPatientId)
    };

    const handleChangeDriver = (event) => {
      setDriver(event.target.value);
  };

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const handleClose = () => {
        setError({ type: "", year: "", policeNumber: "" })
        setOpen(false);
    };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'UID', width: 280 },
    {
      field: 'Type',
      headerName: 'Type',
      width: 200,
      editable: true,
    },
    {
      field: 'Year',
      headerName: 'Year',
      width: 200,
      editable: true,
    },
    {
        field: 'PoliceNumber',
        headerName: 'Police Number',
        width: 200,
        editable: true,
    },
    {
        field: 'Status',
        headerName: 'Status',
        width: 200,
        editable: true,
    },
    {
        field: 'action1',
        headerName: '',
        width: 120,
        renderCell: (params) => {
        
          const [open, setOpen] = React.useState(false);
          const [selectedValue, setSelectedValue] = React.useState();
  
          const handleCloseDialogUse = async () => {
            setErrorUse({ destination: "", patient: "", driver: "" })
            setPatient('');
            setDriver('');
            setOpen(false)
          };
          
          const handleClick = async (ambulanceId) => {
            setAmbulanceId(ambulanceId)
            setOpen(true)
          };

          const handleCloseUse = async (destination: string) => {
            let isValid = true;
            let errors = { destination: "", patient: "", driver: "" };
        
            if (destination.trim().length < 1) {
                isValid = false;
                errors.destination = "Destination must be filled.";
            }
            if (patient.trim().length < 1) {
                isValid = false;
                errors.patient = "Patient Name must be filled.";
            }
            if (driver.trim().length < 1) {
                isValid = false;
                errors.driver = "Driver Name must be filled.";
            }
            setErrorUse(errors);
        
            if(isValid){
                setOpen(false);
                console.log(bedIdToBeStored)
                const collectionRef = collection(db, 'ambulances');
                const snapshot = await getDocs(collectionRef);
                
                snapshot.forEach(async (document)  => {
                  if(document.id == ambulanceId){
                    const updatedData = {
                      status: "Used",
                    };
                  
                      const userDocRef = doc(getFirestore(), 'ambulances', ambulanceId);
                      await updateDoc(userDocRef, updatedData);
                      const date = new Date().toISOString().split('T')[0];
                      insertJob("Picking Up Patient", "", patientIdToBeStored, date, date, roomToBeStored, bedToBeStored, "Ambulance Driver", "Unfinished")
                      
                      const collectionRef = collection(db, 'bed');
                      const snapshot = await getDocs(collectionRef);
                      snapshot.forEach(async (document)  => {
                        if(document.id == bedIdToBeStored){
                          const updatedData = {
                            patient: patientIdToBeStored,
                            bedStatus: "Filled with patients"
                          };
                          const userDocRef = doc(getFirestore(), 'bed', bedIdToBeStored);
                          await updateDoc(userDocRef, updatedData);
                        }
                      });
                      enqueueSnackbar('Success Use Ambulance!', { variant: 'success' });    
                      setRefreshList(true);
                  }
                });
                setErrorUse({ destination: "", patient: "", driver: "" })
                setPatient('');
                setDriver('');
              }
          };
  
          if(params.row.Status == "Unusable" || params.row.Status == "Used" || dataRoom.length === 0 || isBedLeft === false){
              return null
          }
  
          return (
            <div>
            <Button variant="contained" color="primary" onClick={() => handleClick(params.row.id)}>
              Use
            </Button>
            <Dialog open={open} onClose={handleCloseDialogUse} aria-labelledby="form-dialog-title">
                <DialogTitle>
                  Use Ambulance
                </DialogTitle>
                <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="destination"
                            label="Destination"
                            name="destination"
                            autoFocus
                            helperText={errorUse.destination}
                            error={errorUse.destination.length > 0}
                            // value={name}
                            // onChange={(e) => setName(e.target.value)}
                        />
                        <FormControl fullWidth required margin="normal"
                            error={errorUse.patient.length > 0}
                            >
                            <InputLabel>Patient Name</InputLabel>
                            <Select labelId="patient" id="patient" label="Patient Name" value={patient} onChange={handleChange}>
                                {dropdownDataPatient.map((item) => (
                                    <MenuItem key={item.data.name} value={item.data.name}>{item.data.name}</MenuItem>
                                ))}
                            </Select>
                        {errorUse.patient && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUse.patient}</div>}
                        </FormControl>
                        <FormControl fullWidth required margin="normal"
                            error={errorUse.driver.length > 0}
                            >
                            <InputLabel>Driver</InputLabel>
                            <Select labelId="driver" id="driver" label="Driver" value={driver} onChange={handleChangeDriver}>
                                {dropdownDataDriver.map((item) => (
                                    <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                ))}
                            </Select>
                        {errorUse.driver && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUse.driver}</div>}
                        </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogUse} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseUse((document.getElementById("destination") as HTMLInputElement).value)}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Use
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
        width: 100,
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
  
          if(params.row.Status == "Unusable" || params.row.Status == "Used"){
              return null
          }
  
          return (
            <div>
            <Button variant="contained" color="error" onClick={handleClick}>
                Ban
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
      const collectionRef = collection(db, 'ambulances');

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

  const fetchDatabedAvailability = async (roomId) => { 
    const collectionRef = collection(db, 'bed');
    const bedQuery = query(
      collectionRef,
      where('bedStatus', '==', "Available"),
      where('roomId', '==', roomId)
    );

    try {
      const querySnapshot = await getDocs(bedQuery);
  
      if (!querySnapshot.empty) {
        const firstBedDoc = querySnapshot.docs[0];
        const firstBedId = firstBedDoc.id;
        const firstBedData = firstBedDoc.data().number;
        setBedToBeStored(firstBedData)
        setRoomToBeStored(roomId)
        setBedIdToBeStored(firstBedId)
        return true;
      }
  
      return false;
    } catch (error) {
      console.error('Error fetching bed data:', error);
      return false;
    }
  };

  useEffect(() => {    
    // Define a function to fetch the data from Firestore
    const fetchData = async () => {
      const collectionRef = collection(db, 'room');
      
      try {
        const querySnapshot = await getDocs(collectionRef);
        
        const filteredData = querySnapshot.docs
          .filter((doc) => doc.data().roomType === "Emergency")
          .map(async (doc) => {
            const roomData = doc.data();
            const bedsLeft = roomData.roomCapacity - roomData.bedCount;
            
            if(roomData.bedCount > 0 && await fetchDatabedAvailability(roomData.roomId) === true){
              setIsBedLeft(true);
            }

            return {
              id: doc.id,
              data: {
                ...roomData,
                bedsLeft: bedsLeft
              }
            };
          });
          
        setDataRoom(filteredData);
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
        const collectionRef = collection(db, 'ambulances');
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
    if(refreshList){
      const fetchData = async () => {
        const collectionRef = collection(db, 'room');
        
        try {
          const querySnapshot = await getDocs(collectionRef);
          
          const filteredData = querySnapshot.docs
            .filter((doc) => doc.data().roomType === "Emergency")
            .map(async (doc) => {
              const roomData = doc.data();
              const bedsLeft = roomData.roomCapacity - roomData.bedCount;
              
              if(roomData.bedCount > 0 && await fetchDatabedAvailability(roomData.roomId) === true){
                setIsBedLeft(true);
              }

              return {
                id: doc.id,
                data: {
                  ...roomData,
                  bedsLeft: bedsLeft
                }
              };
            });
            
          setDataRoom(filteredData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
      setRefreshList(false)
    }
  }, [refreshList]);

  useEffect(() => {
    const fetchData = async () => {
      const collectionRef = collection(db, 'patients');
  
      try {
        const querySnapshot = await getDocs(collectionRef);
        const data = querySnapshot.docs.map((doc) => doc.data());
        setDropdownData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleAddNewAmbulance = () => {
    setOpen(true);
  };

  const handleCloseAdd = (type: string, year: string, policeNumber: string) => {
    let isValid = true;
    let errors = { type: "", year: "", policeNumber: "" };

    if (type.trim().length < 1) {
        isValid = false;
        errors.type = "Type must be filled.";
    }
    if (year.trim().length < 1) {
        isValid = false;
        errors.year = "Year must be filled.";
    }
    if (policeNumber.trim().length < 1) {
        isValid = false;
        errors.policeNumber = "Police Number must be filled.";
    }
    setError(errors);

    if(isValid){
        setOpen(false);
        insertAmbulance(type, year, policeNumber, "Available");
        enqueueSnackbar('Success Add New Ambulance!', { variant: 'success' });    
        setRefreshList(true)
      }
  };

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Ambulance List
                </Typography>
                <Box marginTop={2} marginBottom={3} width={300}>
                    <Button variant="contained" color="primary" onClick={handleAddNewAmbulance} fullWidth>
                       Add New Ambulance
                    </Button>
                </Box>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    New Ambulance
                </DialogTitle>
                <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="type"
                            label="Type"
                            name="type"
                            autoFocus
                            helperText={error.type}
                            error={error.type.length > 0}
                            // value={name}
                            // onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            id="year"
                            label="Year"
                            type="number"
                            required
                            fullWidth
                            inputProps={{
                                min: 1990,
                                max: 2023,
                                step: 1
                            }}
                            helperText={error.year}
                            error={error.year.length > 0}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="policeNumber"
                            label="Police Number"
                            name="policeNumber"
                            helperText={error.policeNumber}
                            error={error.policeNumber.length > 0}
                            // autoFocus
                            // value={password}
                            // onChange={(e) => setPassword(e.target.value)}
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseAdd((document.getElementById("type") as HTMLInputElement).value, 
                            (document.getElementById("year") as HTMLInputElement).value,
                            (document.getElementById("policeNumber") as HTMLInputElement).value)}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Add
                    </Button>
                </DialogActions>
                </Dialog>
                <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data.map((user) => ({
                    id: user.id,
                    Type: user.data.type,
                    Year: user.data.year,
                    PoliceNumber: user.data.policeNumber,
                    Status: user.data.status
                    }))}
                    columns={columns}
                />
                </div>
            </HomeMenu>
        </SnackbarProvider>
    );
}