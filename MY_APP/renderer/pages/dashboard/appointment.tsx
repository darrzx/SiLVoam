import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
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

async function insertAppointment(queueCategory: string, doctor: string, patient: string, date: string, room: string, bed: string, queueNumber: number, status: string, result: string){
    const staffRef = collection(db, "appointment");
    await setDoc(doc(staffRef), {
        queueCategory: queueCategory, doctor: doctor, patient: patient, date: date, roomId: room, bedNumber: bed, queueNumber: queueNumber, status: status, result: result });
}

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

    const { id, Doctor, AppointmentDate, AppointmentTime, Patient, Room, Bed, QueueNumber, Status, QueueCategory, Result, Role } = param;

    const handleCloseDialog = () => {
      onClose(selectedValue);
    };

    const getJobDocumentId = async (collectionName) => {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef, 
        where('name', '==', 'Appointment With Patient'), 
        where('staff', '==', Doctor), 
        where('patient', '==', Patient)
      );
      
      try {
        const querySnapshot = await getDocs(q);
      
        if (!querySnapshot.empty) {
          // Assuming there is only one document with the specified conditions
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
    
      const getDocumentIdNotif = async () => {
        const collectionRef = collection(db, 'notification');
        const q = query(
          collectionRef, 
          where('name', '==', 'Appointment With Patient'), 
          where('staff', '==', Doctor), 
          where('date', '==', AppointmentDate)
        );
      
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

    const handleCloseDelete = async () => {
        try {
            const docRef = doc(db, 'appointment', id);
            await deleteDoc(docRef);
            getJobDocumentId('job').then(async (jobId) => {
                if (jobId) {
                    const docRef = doc(db, 'job', jobId);
                    await deleteDoc(docRef);    
                }
            });
            getDocumentIdNotif().then(async (notifId) => {
              if (notifId) {
                  const docRef = doc(db, 'notification', notifId);
                  await deleteDoc(docRef);    
                  
              }
            });
            enqueueSnackbar('Success Delete Appointment!', { variant: 'success' });    
            setRefreshList(true)
          } catch (error) {
            console.error('Error deleting document:', error);
          }
        onClose(selectedValue);
      };
  
    return (
        <Dialog onClose={handleCloseDialog} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title">
          Appointment Detail
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            patient : {Patient}
          </Typography>
          <Typography gutterBottom>
            Room : {Room}
          </Typography>
          <Typography gutterBottom>
            Bed : {Bed}
          </Typography>
          <Typography gutterBottom>
            Queue Number : {QueueNumber}
          </Typography>
          <Typography gutterBottom>
            Queue Category : {QueueCategory}
          </Typography>
          <Typography gutterBottom>
            Appointment Result : {Result}
          </Typography>
          <Typography gutterBottom style={{ color: 'blue' }}>
            Status : {Status}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
            Close
          </Button>
          {Status != "Completed" && Role === 'Nurse' && (
            <Button autoFocus onClick={handleCloseDelete} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
}

export default function appointment(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [data, setData] = useState([]);
    const [role, setRole] = useState("");
    const [selectedRow, setSelectedRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState({ queueCategory: "", doctor: "", patient:"", room: "", bed: "", date: "" });
    const [dropdownDataPatient, setDropdownDataPatient] = useState([]);
    const [dropdownDataDoctor, setDropdownDataDoctor] = useState([]);
    const [dropdownDataRoom, setDropdownDataRoom] = useState([]);
    const [dropdownDataBed, setDropdownDataBed] = useState([]);
    const [queueCategory, setQueueCategory] = useState("");
    const [patient, setPatient] = useState("");
    const [doctor, setDoctor] = useState("");
    const [room, setRoom] = useState("");
    const [bed, setBed] = useState("");
    const [currUser, setCurrUser] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [patientName, setPatientName] = useState([]); 
    const [lastQueueNumber, setLastQueueNumber] = useState(0); 

    const [queueCategoryUpdate, setQueueCategoryUpdate] = useState("");
    const [patientUpdate, setPatientUpdate] = useState("");
    const [doctorUpdate, setDoctorUpdate] = useState("");
    const [roomUpdate, setRoomUpdate] = useState("");
    const [bedUpdate, setBedUpdate] = useState("");
    const [selectedDateUpdate, setSelectedDateUpdate] = useState(null);
    const [lastQueueNumberUpdate, setLastQueueNumberUpdate] = useState(0); 
    const [errorUpdate, setErrorUpdate] = useState({ queueCategoryUpdate: "", doctorUpdate: "", patientUpdate:"", roomUpdate: "", bedUpdate: "", dateUpdate: "" });

    const handleChangeQueueCategory = (event) => {
        setQueueCategory(event.target.value);
      };

    const handleDateChange = (date) => {
      setSelectedDate(date.target.value);
    };

    const handleChangeDoctor = (event) => {
        setDoctor(event.target.value);
    };

    const handleChangePatient = (event) => {
        setPatient(event.target.value);
    };

    const handleChangeRoom = (event) => {
      setRoom(event.target.value);
    };

    const handleChangeBed = (event) => {
      setBed(event.target.value);
    };

    const handleChangeQueueCategoryUpdate = (event) => {
      setQueueCategoryUpdate(event.target.value);
    };

  const handleDateChangeUpdate = (date) => {
    setSelectedDateUpdate(date.target.value);
  };

  const handleChangeDoctorUpdate = (event) => {
      setDoctorUpdate(event.target.value);
  };

  const handleChangePatientUpdate = (event) => {
      setPatientUpdate(event.target.value);
  };

  const handleChangeRoomUpdate = (event) => {
    setRoomUpdate(event.target.value);
  };

  const handleChangeBedUpdate = (event) => {
    setBedUpdate(event.target.value);
  };

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const handleClose = () => {
        setError({ queueCategory: "", doctor: "", patient:"", room: "", bed: "", date: "" })
        setPatient('');
        setRoom('');
        setDoctor('')
        setBed('')
        setQueueCategory('')
        setOpen(false);
    };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 250 },
    {
      field: 'Doctor',
      headerName: 'Doctor',
      width: 300,
      editable: true,
    },
    {
      field: 'AppointmentDate',
      headerName: 'Appointment Date',
      width:  200,
      editable: true,
    },
    {
      field: 'AppointmentTime',
      headerName: 'Appointment Time',
      width: 200,
      editable: true,
    },
    {
        field: 'action1',
        headerName: '',
        width: 150,
        renderCell: (params) => {
        
          const [open, setOpen] = useState(false);
          const [selectedValue, setSelectedValue] = useState();
  
          const handleClose = async () => {
            setOpen(false);
          };
          
          const handleClick = async () => {
              setSelectedRow(params.row)
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
      {
        field: 'action2',
        headerName: '',
        width: 150,
        renderCell: (params) => {
        
          const [open, setOpen] = useState(false);
          const [selectedValue, setSelectedValue] = useState();
  
          const handleClose = () => {
            setErrorUpdate({ queueCategoryUpdate: "", doctorUpdate: "", patientUpdate:"", roomUpdate: "", bedUpdate: "", dateUpdate: "" })
            setPatientUpdate('');
            setRoomUpdate('');
            setDoctorUpdate('')
            setBedUpdate('')
            setQueueCategoryUpdate('')
            setOpen(false);
        };
          
          const handleClick = async () => {
              setSelectedRow(params.row)
              setOpen(true);
          };

          useEffect(() => {
            const fetchDataBed = async () => {
              const collectionRef = collection(db, 'bed');
          
              try {
                const querySnapshot = await getDocs(collectionRef);
                const data = querySnapshot.docs.map((doc) => doc.data()).filter((item) => item.roomId === roomUpdate);
                setDropdownDataBed(data);
              } catch (error) {
                console.error('Error fetching data:', error);
              }
            };
          
            fetchDataBed();
          }, [roomUpdate]);

          useEffect(() => {
            const getAppointmentQueueNumberUpdate = async () => {
              try {
                const appointmentsRef = collection(db, 'appointment');
          
                const querySnapshot = await getDocs(query(appointmentsRef, where('queueCategory', '==', queueCategory)));
                const appointmentDocs = querySnapshot.docs;
          
                let newQueueNumber = 1;
          
                if (appointmentDocs.length > 0) {
                  // Sort the appointmentDocs by queueNumber in descending order
                  appointmentDocs.sort((a, b) => b.data().queueNumber - a.data().queueNumber);
          
                  const lastQueueNumber = appointmentDocs[0].data().queueNumber;
                  newQueueNumber = lastQueueNumber + 1;
                }
                setLastQueueNumberUpdate(newQueueNumber);
              } catch (error) {
                console.error('Error adding appointment:', error);
              }
            };
          
            getAppointmentQueueNumberUpdate();
          }, [queueCategoryUpdate]);  

          const fetchDocumentIdDoctorUpdate = async () => {
            const collectionRef = collection(db, 'users');
        
            try {
                const querySnapshot = await getDocs(query(collectionRef, where('name', '==', doctorUpdate), where('role', '==', 'Doctor')));
                const documentId = querySnapshot.docs[0].id;
                return documentId
            } catch (error) {
              console.error('Error fetching document ID:', error);
            }
          };
        
          const fetchDocumentIdpatientUpdate = async () => {
            const collectionRef = collection(db, 'patients');
        
            try {
                const querySnapshot = await getDocs(query(collectionRef, where('name', '==', patientUpdate)));
                const documentId = querySnapshot.docs[0].id;
                return documentId
            } catch (error) {
              console.error('Error fetching document ID:', error);
            }
          };

          const getJobDocumentIdUpdate = async (collectionName) => {
            const collectionRef = collection(db, collectionName);
            const q = query(
              collectionRef, 
              where('name', '==', 'Appointment With Patient'), 
              where('staff', '==', params.row.Doctor), 
              where('patient', '==', params.row.Patient)
            );
            
            try {
              const querySnapshot = await getDocs(q);
            
              if (!querySnapshot.empty) {
                // Assuming there is only one document with the specified conditions
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

          const getDocumentIdNotifUpdate = async () => {
            console.log(params.row.Doctor)
            console.log(params.row.AppointmentDate)

            const collectionRef = collection(db, 'notification');
            const q = query(
              collectionRef, 
              where('name', '==', 'Appointment With Patient'), 
              where('staff', '==', params.row.Doctor), 
              where('date', '==', params.row.AppointmentDate)
            );
          
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

          const handleCloseUpdate = async () => { 
            let isValid = true;
            let errors = { queueCategoryUpdate: "", doctorUpdate: "", patientUpdate:"", roomUpdate: "", bedUpdate: "", dateUpdate: "" };
        
            if (queueCategoryUpdate.trim().length < 1) {
                isValid = false;
                errors.queueCategoryUpdate = "Queue Category must be filled.";
            }
        
            if (doctorUpdate.trim().length < 1) {
                isValid = false;
                errors.doctorUpdate = "Doctor Name must be filled.";
            }
        
            if (patientUpdate.trim().length < 1) {
                isValid = false;
                errors.patientUpdate = "Patient Name must be filled.";
            }
        
            if (roomUpdate.trim().length < 1) {
                isValid = false;
                errors.roomUpdate = "Room must be filled.";
            }
        
            if (bedUpdate.trim().length < 1) {
              isValid = false;
              errors.bedUpdate = "Bed must be filled.";
            }
        
            if(!selectedDateUpdate){
              isValid = false;
              errors.dateUpdate = "Date must be filled.";
            }
        
            setErrorUpdate(errors);
        
            if(isValid){
              const date = new Date().toISOString().split('T')[0];
              const storedDoctorId = await fetchDocumentIdDoctorUpdate()
              const storedPatientId = await fetchDocumentIdpatientUpdate()

              const collectionRef = collection(db, 'appointment');
              const snapshot = await getDocs(collectionRef);
              
              snapshot.forEach(async (document)  => {
                if(document.id == params.row.id){
                  const updatedDataAppointment = {
                    queueCategory: queueCategoryUpdate, 
                    doctor: storedDoctorId, 
                    patient: storedPatientId, 
                    date: selectedDateUpdate, 
                    roomId: roomUpdate, 
                    bedNumber: bedUpdate, 
                    queueNumber: lastQueueNumberUpdate,
                    status: "Queued", 
                    result: "" 
                  };
                    const userDocRef = doc(getFirestore(), 'appointment', params.row.id);
                    await updateDoc(userDocRef, updatedDataAppointment);
                }
              });

              getJobDocumentIdUpdate('job').then(async (jobId) => {
                if (jobId) {
                  console.log(jobId)
                  const collectionRefJob = collection(db, 'job');
                  const snapshotJob = await getDocs(collectionRefJob);  

                  snapshotJob.forEach(async (document)  => {
                    if(document.id == jobId){
                        const updatedDataJob = {
                          name: "Appointment With Patient", 
                          staff: storedDoctorId, 
                          patient: storedPatientId, 
                          assignedDate: date, 
                          dueDate: selectedDateUpdate, 
                          room: roomUpdate, 
                          bed: bedUpdate, 
                          category: "Doctor", 
                          status: "Unfinished"
                        };
    
                        const userDocRefJob = doc(getFirestore(), 'job', jobId);
                        await updateDoc(userDocRefJob, updatedDataJob);
                    }
                  });
                }
              });
              getDocumentIdNotifUpdate().then(async (notifId) => {
                if (notifId) {
                  console.log(notifId)
                  const collectionRefNotif = collection(db, 'notification');
                  const snapshotNotif = await getDocs(collectionRefNotif);  

                  snapshotNotif.forEach(async (document)  => {
                    if(document.id == notifId){
                      const updatedDataNotif = {
                        staff: storedDoctorId, 
                        date: selectedDateUpdate
                      };
    
                      const userDocRefNotif = doc(getFirestore(), 'notification', notifId);
                      await updateDoc(userDocRefNotif, updatedDataNotif);
                    }
                  });   
                }
              });
              enqueueSnackbar('Success Update Appointment!', { variant: 'success' });    
              setRefreshList(true);
              setOpen(false); 
              setErrorUpdate({ queueCategoryUpdate: "", doctorUpdate: "", patientUpdate:"", roomUpdate: "", bedUpdate: "", dateUpdate: "" })
              setPatientUpdate('');
              setRoomUpdate('');
              setDoctorUpdate('')
              setBedUpdate('')
              setSelectedDateUpdate('')
              setQueueCategoryUpdate('')
            }
          };
  
          return (
            <div>
              {role === "Nurse" && (
                <Button variant="contained" color="primary" onClick={handleClick}>
                  Update
                </Button>
              )}
            
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle>
                        Update Appointment
                    </DialogTitle>
                    <DialogContent>
                            <FormControl fullWidth required margin="normal"
                                error={errorUpdate.queueCategoryUpdate.length > 0}
                                >
                                <InputLabel>Queue Category</InputLabel>
                                <Select labelId="QueueCategory" id="QueueCategory" label="Queue Category" value={queueCategoryUpdate} onChange={handleChangeQueueCategoryUpdate}>                             
                                        <MenuItem key="Normal" value="Normal">Normal</MenuItem>
                                        <MenuItem key="Urgent" value="Urgent">Urgent</MenuItem>
                                </Select>
                            {errorUpdate.queueCategoryUpdate && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUpdate.queueCategoryUpdate}</div>}
                            </FormControl>
                            <FormControl fullWidth required margin="normal"
                                error={errorUpdate.doctorUpdate.length > 0}
                                >
                                <InputLabel>Doctor Name</InputLabel>
                                <Select labelId="doctor" id="doctor" label="Doctor Name" value={doctorUpdate} onChange={handleChangeDoctorUpdate}>
                                    {dropdownDataDoctor.map((item) => (
                                        <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            {errorUpdate.doctorUpdate && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUpdate.doctorUpdate}</div>}
                            </FormControl>
                            <FormControl fullWidth required margin="normal"
                                error={errorUpdate.patientUpdate.length > 0}
                                >
                                <InputLabel>Patient Name</InputLabel>
                                <Select labelId="patient" id="patient" label="Patient Name" value={patientUpdate} onChange={handleChangePatientUpdate}>
                                    {dropdownDataPatient.map((item) => (
                                        <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            {errorUpdate.patientUpdate && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUpdate.patientUpdate}</div>}
                            </FormControl>
                            <FormControl fullWidth required margin="normal"
                                error={errorUpdate.roomUpdate.length > 0}>
                                <InputLabel>Room</InputLabel>
                                <Select labelId="room" id="room" label="Room" value={roomUpdate} onChange={handleChangeRoomUpdate}>
                                    {dropdownDataRoom.map((item) => (
                                        <MenuItem key={item.roomId} value={item.roomId}>{item.roomId}</MenuItem>
                                    ))}
                                </Select>
                            {errorUpdate.roomUpdate && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUpdate.roomUpdate}</div>}
                            </FormControl>

                            {roomUpdate && (
                            <FormControl fullWidth required margin="normal" error={errorUpdate.bedUpdate.length > 0}>
                                <InputLabel>Bed</InputLabel>
                                <Select labelId="bed" id="bed" label="Bed" value={bedUpdate} onChange={handleChangeBedUpdate}>
                                    {dropdownDataBed.map((item) => (
                                        <MenuItem key={item.number} value={item.number}>{item.number}</MenuItem>
                                    ))}
                                </Select>
                                {errorUpdate.bedUpdate && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUpdate.bedUpdate}</div>}
                            </FormControl>
                            )}
                            <TextField
                            id="date"
                            label="Date"
                            type="date"
                            fullWidth
                            defaultValue={new Date().toISOString().split('T')[0]}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            style={{ marginTop: '16px' }}
                            value={selectedDateUpdate}
                            onChange={handleDateChangeUpdate}
                            helperText={errorUpdate.dateUpdate}
                            error={errorUpdate.dateUpdate.length > 0}
                            />
                            
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                        Cancel
                        </Button>
                        <Button onClick={()=>{handleCloseUpdate()}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                        Update
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
    const storedName = localStorage.getItem('name');
    const storedRole = localStorage.getItem('role');
    setCurrUser(storedName);
  
    const fetchData = async () => {
        if(storedRole === "Nurse"){
            const collectionRef = collection(db, 'appointment');
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
        }else if (storedRole === "Doctor"){
            const collectionRef = collection(db, 'appointment');
            try {
                const querySnapshot = await getDocs(collectionRef);

                const fetchedData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
            })).filter((item) => item.data.doctor === storedId);
                setData(fetchedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };
  
    fetchData();
  }, []);  

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    const storedName = localStorage.getItem('name');
    const storedRole = localStorage.getItem('role');

    setCurrUser(storedName);
  
    if(refreshList){
      const fetchData = async () => {
        if(storedRole === "Nurse"){
            const collectionRef = collection(db, 'appointment');
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
        }else if (storedRole === "Doctor"){
            const collectionRef = collection(db, 'appointment');
            try {
                const querySnapshot = await getDocs(collectionRef);

                const fetchedData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
            })).filter((item) => item.data.doctor === storedId);
                setData(fetchedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
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
        const querySnapshot = await getDocs(query(collectionRef, where('role', '==', 'Doctor')));
        const data = querySnapshot.docs.map((doc) => doc.data());
        setDropdownDataDoctor(data);
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

  const handleAddNewAppointment = () => {
    setOpen(true);
  };

  const fetchDocumentIdDoctor = async () => {
    const collectionRef = collection(db, 'users');

    try {
        const querySnapshot = await getDocs(query(collectionRef, where('name', '==', doctor), where('role', '==', 'Doctor')));
        const documentId = querySnapshot.docs[0].id;
        return documentId
    } catch (error) {
      console.error('Error fetching document ID:', error);
    }
  };

  const fetchDocumentIdpatient = async () => {
    const collectionRef = collection(db, 'patients');

    try {
        const querySnapshot = await getDocs(query(collectionRef, where('name', '==', patient)));
        const documentId = querySnapshot.docs[0].id;
        return documentId
    } catch (error) {
      console.error('Error fetching document ID:', error);
    }
  };

  useEffect(() => {
    const getAppointmentQueueNumber = async () => {
      try {
        const appointmentsRef = collection(db, 'appointment');
  
        const querySnapshot = await getDocs(query(appointmentsRef, where('queueCategory', '==', queueCategory)));
        const appointmentDocs = querySnapshot.docs;
  
        let newQueueNumber = 1;
  
        if (appointmentDocs.length > 0) {
          // Sort the appointmentDocs by queueNumber in descending order
          appointmentDocs.sort((a, b) => b.data().queueNumber - a.data().queueNumber);
  
          const lastQueueNumber = appointmentDocs[0].data().queueNumber;
          newQueueNumber = lastQueueNumber + 1;
        }
        setLastQueueNumber(newQueueNumber);
      } catch (error) {
        console.error('Error adding appointment:', error);
      }
    };
  
    getAppointmentQueueNumber();
  }, [queueCategory]);  

  const handleCloseAdd = async () => { 
    let isValid = true;
    let errors = { queueCategory: "", doctor: "", patient:"", room: "", bed: "", date: "" };

    if (queueCategory.trim().length < 1) {
        isValid = false;
        errors.queueCategory = "Queue Category must be filled.";
    }

    if (doctor.trim().length < 1) {
        isValid = false;
        errors.doctor = "Doctor Name must be filled.";
    }

    if (patient.trim().length < 1) {
        isValid = false;
        errors.patient = "Patient Name must be filled.";
    }

    if (room.trim().length < 1) {
        isValid = false;
        errors.room = "Room must be filled.";
    }

    if (bed.trim().length < 1) {
      isValid = false;
      errors.bed = "Bed must be filled.";
    }

    if(!selectedDate){
      isValid = false;
      errors.date = "Date must be filled.";
    }

    setError(errors);

    if(isValid){
        const date = new Date().toISOString().split('T')[0];
        const storedRole = localStorage.getItem('role');
        const storedId = localStorage.getItem('id');
        const storedDoctorId = await fetchDocumentIdDoctor()
        const storedPatientId = await fetchDocumentIdpatient()

        insertAppointment(queueCategory, storedDoctorId, storedPatientId, selectedDate, room, bed, lastQueueNumber, "Queued", "")
        insertJob("Appointment With Patient", storedDoctorId, storedPatientId, date, selectedDate, room, bed, "Doctor", "Unfinished")

        insertNotification("New Assigned Job", "Appointment With Patient", selectedDate, storedDoctorId)
        setOpen(false);
        setRefreshList(true)
        enqueueSnackbar('Success Create New Appointment!', { variant: 'success' });    
      }
  };

  const filteredRows = data.map((user, index) => ({
    id: user.id,
    Doctor: user.data.doctor,
    AppointmentDate: user.data.date,
    AppointmentTime: user.data.date,
    Patient: user.data.patient,
    Room: user.data.roomId,
    Bed: user.data.bedNumber,
    QueueNumber: user.data.queueNumber,
    Status: user.data.status,
    QueueCategory: user.data.queueCategory,
    Result: user.data.result,
    Role: role
  }));

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Appointment List
                </Typography>
                {role === 'Nurse' && (
                <Box marginTop={2} marginBottom={3} width={300}>
                    <Button variant="contained" color="primary" onClick={handleAddNewAppointment} fullWidth>
                    Create New Appointment
                    </Button>
                </Box>
                )}
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle>
                        New Appointment
                    </DialogTitle>
                    <DialogContent>
                            <FormControl fullWidth required margin="normal"
                                error={error.queueCategory.length > 0}
                                >
                                <InputLabel>Queue Category</InputLabel>
                                <Select labelId="QueueCategory" id="QueueCategory" label="Queue Category" value={queueCategory} onChange={handleChangeQueueCategory}>                             
                                        <MenuItem key="Normal" value="Normal">Normal</MenuItem>
                                        <MenuItem key="Urgent" value="Urgent">Urgent</MenuItem>
                                </Select>
                            {error.queueCategory && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.queueCategory}</div>}
                            </FormControl>
                            <FormControl fullWidth required margin="normal"
                                error={error.doctor.length > 0}
                                >
                                <InputLabel>Doctor Name</InputLabel>
                                <Select labelId="doctor" id="doctor" label="Doctor Name" value={doctor} onChange={handleChangeDoctor}>
                                    {dropdownDataDoctor.map((item) => (
                                        <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                    ))}
                                </Select>
                            {error.doctor && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.doctor}</div>}
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
                            <TextField
                            id="date"
                            label="Date"
                            type="date"
                            fullWidth
                            defaultValue={new Date().toISOString().split('T')[0]}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            style={{ marginTop: '16px' }}
                            value={selectedDate}
                            onChange={handleDateChange}
                            helperText={error.date}
                            error={error.date.length > 0}
                            />
                            
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                        Cancel
                        </Button>
                        <Button onClick={()=>{handleCloseAdd()}} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                        Create
                        </Button>
                    </DialogActions>
                </Dialog>

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