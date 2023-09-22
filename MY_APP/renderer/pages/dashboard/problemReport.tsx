import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../utils/db';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import WorkIcon from '@mui/icons-material/Work';
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import { createStyles, FormControlLabel, FormLabel, Radio, RadioGroup, Theme, withStyles } from '@material-ui/core';
import { WithStyles } from '@material-ui/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

async function insertReport(room: string, patient: string, problem: string, date: string, division: string, reportedBy: string, status: string){
    const staffRef = collection(db, "problemreport");
    await setDoc(doc(staffRef), {
        room: room, patient: patient, problem: problem, date: date, division: division, reportedBy: reportedBy, status: status });
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

    const { id, Room, Patient, Problem, Date, reportedBy, status } = param;

    const handleCloseDialog = () => {
      onClose(selectedValue);
    };
  
    return (
        <Dialog onClose={handleCloseDialog} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title">
          Problem Report - {Room} - {Patient}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Problem : {Problem}
          </Typography>
          <Typography gutterBottom>
            Date : {Date}
          </Typography>
          <Typography gutterBottom>
            Reported By : {reportedBy}
          </Typography>
          <Typography gutterBottom style={{ color: 'blue' }}>
            Status : {status}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

export default function problemReport(){
    const { enqueueSnackbar } = useSnackbar();
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({ room: "", patient: "", problem: "" });
    const [dropdownData, setDropdownData] = useState([]);
    const [patient, setPatient] = useState("");

    const handleChange = (event) => {
        setPatient(event.target.value);
    };

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const handleClose = () => {
        setError({ room: "", patient: "", problem: "" })
        setPatient('');
        setOpen(false);
    };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'UID', width: 280 },
    {
      field: 'Room',
      headerName: 'Room',
      width: 200,
      editable: true,
    },
    {
      field: 'Patient',
      headerName: 'Patient',
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
            console.log(params.row)
            setOpen(true);
        };

        return (
          <div>
          <Button variant="contained" color="primary" onClick={handleClick}>
              Detail
          </Button>
          <SimpleDialog setRefreshList={setRefreshList} param={selectedRow} selectedValue={selectedValue} open={open} onClose={handleClose} />
          </div>
          
        );
      },
    },
  ];

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    
    // Define a function to fetch the data from Firestore
    const fetchData = async () => { 
      const collectionRef = collection(db, 'problemreport');

      try {
        const querySnapshot = await getDocs(collectionRef);

        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      })).filter((item) => item.data.division === storedRole);
        setData(fetchedData);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');

    // Define a function to fetch the data from Firestore
    if(refreshList){
      const fetchData = async () => {
        const collectionRef = collection(db, 'problemreport');
        try {
          const querySnapshot = await getDocs(collectionRef);
  
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        })).filter((item) => item.data.division === storedRole);
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

  const handleAddNewReport = () => {
    setOpen(true);
  };

  const handleCloseReport = (room: string, problem: string) => {
    let isValid = true;
    let errors = { room: "", patient: "", problem: "" };

    if (room.trim().length < 5) {
        isValid = false;
        errors.room = "Room must be filled.";
    }
    if (patient.trim().length < 1) {
        isValid = false;
        errors.patient = "Patient Name must be filled.";
    }
    if (problem.trim().length < 5) {
        isValid = false;
        errors.problem = "Problem must be filled.";
    }
    setError(errors);
    if(isValid){
        const storedRole = localStorage.getItem('role');
        const storedName = localStorage.getItem('name');
        const storedId = localStorage.getItem('id');

        const date = new Date().toISOString().split('T')[0];

        setOpen(false);
        insertReport(room, patient, problem, date, storedRole, storedName, "none");
        insertNotification("Problem Report", problem, date, storedId)
        enqueueSnackbar('Success Add New Report!', { variant: 'success' });    
        setRefreshList(true)
      }
  };

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Problem Report List
                </Typography>
                <Box marginTop={2} marginBottom={3} width={300}>
                    <Button variant="contained" color="primary" onClick={handleAddNewReport} fullWidth>
                        Make New Report
                    </Button>
                </Box>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    Problem Report 
                </DialogTitle>
                <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="room"
                            label="Room"
                            name="room"
                            autoFocus
                            helperText={error.room}
                            error={error.room.length > 0}
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
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="problem"
                            label="Problem"
                            name="problem"
                            helperText={error.problem}
                            error={error.problem.length > 0}
                            // autoFocus
                            // value={password}
                            // onChange={(e) => setPassword(e.target.value)}
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                    Cancel
                    </Button>
                    <Button onClick={()=>{handleCloseReport((document.getElementById("room") as HTMLInputElement).value, 
                            (document.getElementById("problem") as HTMLInputElement).value)}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                    Add
                    </Button>
                </DialogActions>
                </Dialog>
                <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data.map((user) => ({
                    id: user.id,
                    Room: user.data.room,
                    Patient: user.data.patient,
                    Problem: user.data.problem,
                    Date: user.data.date,
                    reportedBy: user.data.reportedBy,
                    status: user.data.status
                }))}
                    columns={columns}
                />
                </div>
            </HomeMenu>
        </SnackbarProvider>
    );
}