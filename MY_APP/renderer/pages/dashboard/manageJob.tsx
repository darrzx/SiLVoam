import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
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

async function insertJob(name: string, staff: string, patient: string, assignedDate: string, dueDate: string, room: string, bed: string, category: string, status: string){
    const staffRef = collection(db, "job");
    await setDoc(doc(staffRef), {
      name: name, staff: staff, patient: patient, assignedDate: assignedDate, dueDate: dueDate, room: room, bed: bed, category: category, status: status });
}

async function insertNotification(category: string, name: string, date: string, staff: string){
  const staffRef = collection(db, "notification");
  await setDoc(doc(staffRef), {
    category: category, name: name, date: date, staff: staff });
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

    const handleUpdateStatus = async () => {
      onClose(selectedValue);
  
      console.log(param)
      const { id, shift, email, role } = param;
      const collectionRef = collection(db, 'job');
      const snapshot = await getDocs(collectionRef);
      
      snapshot.forEach(async (document)  => {
        if(document.id == id){
          const updatedData = {
            status: "Complete",
        };
        
            const userDocRef = doc(getFirestore(), 'job', id);
            await updateDoc(userDocRef, updatedData);
            enqueueSnackbar('Success Complete Job!', { variant: 'success' });
            setRefreshList(true);
        }
      });
    };
  
    return (
        <Dialog onClose={handleCloseDialog} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title">
          Job Update
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
              Do you want to complete this job?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Close
          </Button>
          <Button onClick={handleUpdateStatus} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const getDocumentIdByName = async (collectionName, fieldName, fieldValue) => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(fieldName, '==', fieldValue));
  
    try {
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the specified name
        const doc = querySnapshot.docs[0];
        return doc.id;
      }
  
      // Handle case where no matching document is found
      return null;
    } catch (error) {
      console.error('Error getting document ID:', error);
      return null;
    }
  };

  const fetchDataById = async (id) => {
    const docRef = doc(collection(db, 'patients'), id);
    
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Process the retrieved data as needed
        return data.name;
      } else {
        console.log('No document found with the provided ID');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

export default function manageJob(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({ job: "", patient: "", room: "", dob: "", bed: "" });
    const [dropdownData, setDropdownData] = useState([]);
    const [dropdownDataRoom, setDropdownDataRoom] = useState([]);
    const [dropdownDataBed, setDropdownDataBed] = useState([]);
    const [patient, setPatient] = useState("");
    const [room, setRoom] = useState("");
    const [bed, setBed] = useState("");
    const [currUser, setCurrUser] = useState("");
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [patientName, setPatientName] = useState([]); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchDate, setSearchDate] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const handleDateChange = (date) => {
      setSelectedDate(date.target.value);
    };

    const handleSearchQueryChange = (event) => {
      setSearchQuery(event.target.value);
    };

    useEffect(() => {
      const filtered = data.filter((item) => {
        const itemName = item.data.name || ''; 
        const search = searchQuery || ''; 
        return itemName.toLowerCase().includes(search.toLowerCase());
      });
      
      setFilteredData(filtered);
    }, [searchQuery, data]);

    const handleChange = (event) => {
        setPatient(event.target.value);
    };

    const handleChangeRoom = (event) => {
      setRoom(event.target.value);
    };

    const handleChangeBed = (event) => {
      setBed(event.target.value);
    };

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const handleClose = () => {
        setError({ job: "", patient: "", room: "", dob: "", bed: "" })
        setPatient('');
        setRoom('');
        setOpen(false);
    };

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'UID', width: 250 },
    {
      field: 'Job',
      headerName: 'Job',
      width: 200,
      editable: true,
    },
    {
      field: 'Staff',
      headerName: 'Staff',
      width:  150,
      editable: true,
    },
    {
      field: 'Patient',
      headerName: 'Patient',
      width: 150,
      editable: true,
    },
    {
      field: 'AssignedDate',
      headerName: 'Assigned Date',
      width: 150,
      editable: true,
    },
    {
      field: 'DueDate',
      headerName: 'Due Date',
      width: 150,
      editable: true,
    },
    {
      field: 'Room',
      headerName: 'Room',
      width: 120,
      editable: true,
    },
    {
      field: 'Bed',
      headerName: 'Bed',
      width: 100,
      editable: true,
    },
    {
      field: 'Category',
      headerName: 'Category',
      width: 200,
      editable: true,
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: 150,
      editable: true,
    },
    {
      field: 'action1',
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

        if(params.row.Status == "Late" || params.row.Status == "Complete"){
            return null
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
  ];

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    const storedName = localStorage.getItem('name');
    setCurrUser(storedName);
  
    const fetchData = async () => {
      const collectionRef = collection(db, 'job');
      try {
        const querySnapshot = await getDocs(collectionRef);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })).filter((item) => item.data.staff === storedId);
  
        setPatientName([]);
        const updatedData = fetchedData.map(async (item) => {
          const patientName = await fetchDataById(item.data.patient);
          if (patientName) {
            setPatientName((prevPatientNames) => [...prevPatientNames, patientName]);
          }
  
          const currentDate = new Date();
          const dueDate = new Date(item.data.dueDate);
          const isLate = currentDate > dueDate;
  
          if (isLate && (item.data.status != 'Late' && item.data.status != 'Complete')) {
            const jobRef = doc(collection(db, 'job'), item.id);
            try {
              // Update the status field to 'Late' immediately in the local data
              item.data.status = 'Late';
              await updateDoc(jobRef, { status: 'Late' });
              const date = new Date().toISOString().split('T')[0];

              insertNotification("Lateness", "There is job that exceeds the due date", date, storedId)
            } catch (error) {
              console.error('Error updating status:', error);
            }
          }
  
          return { ...item };
        });
  
        // Wait for all the promises to resolve
        const updatedDataWithLateStatus = await Promise.all(updatedData);
        setData(updatedDataWithLateStatus);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);  

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    const storedName = localStorage.getItem('name');
    setCurrUser(storedName);
  
    if(refreshList){
      const fetchData = async () => {
        const collectionRef = collection(db, 'job');
        try {
          const querySnapshot = await getDocs(collectionRef);
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          })).filter((item) => item.data.staff === storedId);
    
          setPatientName([]);
          const updatedData = fetchedData.map(async (item) => {
            const patientName = await fetchDataById(item.data.patient);
            if (patientName) {
              setPatientName((prevPatientNames) => [...prevPatientNames, patientName]);
            }
    
            const currentDate = new Date();
            const dueDate = new Date(item.data.dueDate);
            const isLate = currentDate > dueDate;
    
            if (isLate) {
              const jobRef = doc(collection(db, 'job'), item.id);
              try {
                // Update the status field to 'Late' immediately in the local data
                item.data.status = 'Late';
                await updateDoc(jobRef, { status: 'Late' });
              } catch (error) {
                console.error('Error updating status:', error);
              }
            }
    
            return { ...item };
          });
    
          // Wait for all the promises to resolve
          const updatedDataWithLateStatus = await Promise.all(updatedData);
          setData(updatedDataWithLateStatus);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
      setRefreshList(false);
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

  useEffect(() => {
    const fetchDataRoom = async () => {
      const collectionRef = collection(db, 'room');
  
      try {
        const querySnapshot = await getDocs(collectionRef);
        const data = querySnapshot.docs.map((doc) => doc.data());
        setDropdownDataRoom(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchDataRoom();
  }, []);

  useEffect(() => {
    const fetchDataBed = async () => {
      const collectionRef = collection(db, 'bed');
  
      try {
        const querySnapshot = await getDocs(collectionRef);
        const data = querySnapshot.docs.map((doc) => doc.data()).filter((item) => item.roomId === room);
        setDropdownDataBed(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchDataBed();
  }, [room]);

  const handleAddNewJob = () => {
    setOpen(true);
  };

  const handleCloseAdd = async (job: string) => { 
    let isValid = true;
    let errors = { job: "", patient: "", room: "", dob: "", bed: "" };

    if (job.trim().length < 5) {
        isValid = false;
        errors.job = "Job must be filled.";
    }

    if (patient.trim().length < 1) {
        isValid = false;
        errors.patient = "Patient Name must be filled.";
    }

    if (room.trim().length < 5) {
        isValid = false;
        errors.room = "Room must be filled.";
    }

    if (bed.trim().length < 1) {
      isValid = false;
      errors.bed = "Bed must be filled.";
    }

    if(!selectedDate){
      isValid = false;
      errors.dob = "Due Date must be filled.";
    }

    setError(errors);
    if(isValid){
        const storedRole = localStorage.getItem('role');
        const storedName = localStorage.getItem('name');
        const storedId = localStorage.getItem('id');
        const date = new Date().toISOString().split('T')[0];

        getDocumentIdByName('users', 'name', storedName).then((docId) => {
          if (docId) {
            getDocumentIdByName('patients', 'name', patient).then((patientId) => {
              if (patientId) {
                insertJob(job, docId, patientId, date, selectedDate, room, bed, storedRole, "Unfinished")
                setRefreshList(true)
              }
            });
          }
        });
        setOpen(false);
        insertNotification("New Assigned Job", job, date, storedId)
        enqueueSnackbar('Success Add New Job!', { variant: 'success' });    
      }
  };

  const handleSearcDate = () => {
    if(searchDate){
      setSearchDate(false);
    }else{
      setSearchDate(true);
    }
  };

  const filteredRows = filteredData.map((user, index) => ({
    id: user.id,
    Job: user.data.name,
    Staff: currUser,
    AssignedDate: user.data.assignedDate,
    Category: user.data.category,
    DueDate: user.data.dueDate,
    Patient: patientName[index],
    Room: user.data.room,
    Bed: user.data.bed,
    Status: user.data.status,
  }))
  .filter((row) => {
    // Apply date range filter
    if (startDate && endDate && searchDate) {
      const assignedDate = new Date(row.AssignedDate);
      const rangeStartDate = new Date(startDate);
      const rangeEndDate = new Date(endDate);

      const isInDateRange = assignedDate >= rangeStartDate && assignedDate <= rangeEndDate;
      return isInDateRange;

    }
    return true;
  });

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Job
                </Typography>
                <Box marginTop={2} marginBottom={3} width={300}>
                <div>
                  {role === "Administration Staff" && (
                    <Button variant="contained" color="primary" onClick={handleAddNewJob} fullWidth>
                      Add Non Routine Job
                    </Button>
                  )}
                </div>
                </Box>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    Non Routine Job
                </DialogTitle>
                <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="job"
                            label="Job"
                            name="job"
                            autoFocus
                            helperText={error.job}
                            error={error.job.length > 0}
                            // value={name}
                            // onChange={(e) => setName(e.target.value)}
                        />
                        <FormControl fullWidth required margin="normal"
                            error={error.patient.length > 0}>
                            <InputLabel>Patient Name</InputLabel>
                            <Select labelId="patient" id="patient" label="Patient Name" value={patient} onChange={handleChange}>
                                {dropdownData.map((item) => (
                                    <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                ))}
                            </Select>
                        {error.patient && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.patient}</div>}
                        </FormControl>
                        <TextField
                          id="dueDate"
                          label="Due Date"
                          type="date"
                          fullWidth
                          defaultValue={new Date().toISOString().split('T')[0]}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          style={{ marginTop: '16px' }}
                          value={selectedDate}
                          onChange={handleDateChange}
                          helperText={error.dob}
                          error={error.dob.length > 0}
                        />
                        <FormControl fullWidth required margin="normal"
                            error={error.room.length > 0}>
                            <InputLabel>Room</InputLabel>
                            <Select labelId="room" id="room" label="Room" value={room} onChange={handleChangeRoom}>
                                {dropdownDataRoom.map((item) => (
                                    <MenuItem key={item.roomId} value={item.roomId}>{item.roomId}</MenuItem>
                                ))}
                            </Select>
                        {error.room && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.room}</div>}
                        </FormControl>

                        {room && (
                          <FormControl fullWidth required margin="normal" error={error.bed.length > 0}>
                            <InputLabel>Bed</InputLabel>
                            <Select labelId="bed" id="bed" label="Bed" value={bed} onChange={handleChangeBed}>
                                {dropdownDataBed.map((item) => (
                                    <MenuItem key={item.number} value={item.number}>{item.number}</MenuItem>
                                ))}
                            </Select>
                            {error.bed && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.bed}</div>}
                          </FormControl>
                        )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseAdd((document.getElementById("job") as HTMLInputElement).value)}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Add
                    </Button>
                </DialogActions>
                </Dialog>
                <TextField
                  label="Search"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  style={{ width: '50%', marginBottom: 20 }}
                />
                <div style={{ display: 'flex', marginBottom: 20 }}>
                    <TextField
                      label="Start Date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ marginRight: 10 }}
                    />

                    <TextField
                      label="End Date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ marginRight: 10 }}
                    />
                    {searchDate ? (
                      <div>
                        <Button onClick={handleSearcDate} variant="contained" color="error" style={{ marginRight: '10px', padding: '15px' }}>
                            Stop
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleSearcDate} variant="contained" color="primary" style={{ marginRight: '10px', padding: '10px' }}>
                          Search Date
                      </Button>
                    )}
                    
                </div>
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                      rows={filteredRows}
                      columns={columns}
                  />
                </div>
            </HomeMenu>
        </SnackbarProvider>
    );
}