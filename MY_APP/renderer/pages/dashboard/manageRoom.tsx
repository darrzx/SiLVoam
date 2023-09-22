import React, { useState } from 'react';
import { deleteUser, getAuth } from "firebase/auth";
import Router from "next/router";
import { useEffect } from "react";
import Layout from '../master';
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../utils/db';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import WorkIcon from '@mui/icons-material/Work';
import { SnackbarProvider, VariantType, useSnackbar, enqueueSnackbar } from 'notistack';
import { Card, CardContent } from '@mui/material';
import { differenceInYears, parse } from 'date-fns';

async function insertBed(number: string, status: string, patient: string, roomId: string){
  const staffRef = collection(db, "bed");
  await setDoc(doc(staffRef), {
    number: number, bedStatus: status, patient: patient, roomId: roomId});
}

async function insertJob(name: string, staff: string, patient: string, assignedDate: string, dueDate: string, room: string, bed: string, category: string, status: string){
  const staffRef = collection(db, "job");
  await setDoc(doc(staffRef), {
    name: name, staff: staff, patient: patient, assignedDate: assignedDate, dueDate: dueDate, room: room, bed: bed, category: category, status: status });
}

async function insertRoom(roomId: string, bedCount: number, roomCapacity: number, roomType: string){
  const staffRef = collection(db, "room");
  await setDoc(doc(staffRef), {
    roomId: roomId, bedCount: bedCount, roomCapacity: roomCapacity, roomType: roomType });
}

async function insertNotification(category: string, name: string, date: string, staff: string){
  const staffRef = collection(db, "notification");
  await setDoc(doc(staffRef), {
    category: category, name: name, date: date, staff: staff });
}

export default function manageRoom(){
    const [ refreshList, setRefreshList ] = useState(false);
    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openBedDetail, setOpenBedDetail] = useState(false);
    const [openNewRoom, setOpenNewRoom] = useState(false);
    const [dropdownDataBuilding, setDropdownDataBuilding] = useState([]);
    const [dropdownDataRoomType, setDropdownDataRoomType] = useState([]);
    const [dropdownDataRoomCapacity, setDropdownDataRoomCapacity] = useState([]);
    const [building, setBuilding] = useState("");
    const [roomType, setRoomType] = useState("");
    const [roomCapacity, setRoomCapacity] = useState(0);
    const [roomId, setRoomId] = useState("");
    const [dropdownDataFloor, setDropdownDataFloor] = useState([]);
    const [floor, setFloor] = useState("");
    const [roomList, setRoomList] = useState([]);
    const [bedList, setBedList] = useState([]);
    const [bed, setBed] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedRoomForJob, setSelectedRoomForJob] = useState('');
    const [error, setError] = useState({ bed: "" });
    const [errorRoom, setErrorRoom] = useState({ room: "", roomType: "", roomCapacity: "" });

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]); 
    const [data, setData] = useState([]);
    const [dataPatient, setDataPatient] = useState(null);
    const [selectedPatientIdpatientDetail, setSelectedPatientIdpatientDetail] = useState('');
    const [selectedBedNumberpatientDetail, setSelectedBedNumberpatientDetail] = useState('');
    const [selectedRoomIdpatientDetail, setSelectedRoomIdpatientDetail] = useState('');
    const [selectedDoctorIdForPatientDetail, setSelectedDoctorIdForPatientDetail] = useState('');
    const [selectedDoctorNameForPatientDetail, setSelectedDoctorNameForPatientDetail] = useState('');
    const [selectededBedStatuspatientDetail, setSelectededBedStatuspatientDetail] = useState('');

    const [role, setRole] = useState("");

    useEffect(() => {
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);
    }, []);

    const fetchDropdownData = () => {
      const fetchedData = ['A', 'B', 'C'];
      setDropdownDataBuilding(fetchedData);
    };

    const fetchDropdownDataRoomType = () => {
      const fetchedData = ['Single', 'Sharing', 'VIP', 'Royale', 'Emergency'];
      setDropdownDataRoomType(fetchedData);
    };
    
    useEffect(() => {
      fetchDropdownData();
    }, []);

    useEffect(() => {
      fetchDropdownDataRoomType();
    }, []);

    useEffect(() => {
      const fetchDataBed = async () => {
        const collectionRef = collection(db, 'room');
    
        try {
          const querySnapshot = await getDocs(collectionRef);
          const data = querySnapshot.docs.map((doc) => doc.data().roomId)
          .filter((roomId) => roomId.startsWith(building));
          const uniqueSecondCharactersSet = new Set(data.map((roomId) => roomId.charAt(1)));
          const uniqueSecondCharacters = Array.from(uniqueSecondCharactersSet);
          setDropdownDataFloor(uniqueSecondCharacters);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchDataBed();
    }, [building]);

    const handleChangeRoomType = (event) => {
      setRoomType(event.target.value);
      let capacity = [];
    
      if (event.target.value === 'Single') {
        capacity = [0, 1];
      } else if (event.target.value === 'Sharing') {
        capacity = [0, 1, 2, 3, 4, 5, 6];
      } else if (event.target.value === 'VIP') {
        capacity = [0, 1];
      } else if (event.target.value === 'Royale') {
        capacity = [0, 1];
      } else if (event.target.value === 'Emergency') {
        capacity = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      }
    
      setDropdownDataRoomCapacity(capacity);
    };
    

    const handleChangeRoomCapacity = (event) => {
      setRoomCapacity(event.target.value);
    };

    const handleChangeBuilding = (event) => {
      setBuilding(event.target.value);
    };

    const handleChangeFloor = (event) => {
      setFloor(event.target.value);
    };

    useEffect(() => {
      const combinedResult = `${building}${floor}`;
      console.log(combinedResult);
    
      const fetchDataBed = async () => {
        const collectionRef = collection(db, 'room');
        const rooms = [];
    
        try {
          const querySnapshot = await getDocs(collectionRef);
    
          for (const doc1 of querySnapshot.docs) {
            const roomData = doc1.data();
            const bedDocRef = roomData.beds;
            const bedData = [];
    
            if (bedDocRef) {
              for (const bedRef of bedDocRef) {
                const bedDocSnapshot = await getDoc(doc(db, 'bed', bedRef));
    
                if (bedDocSnapshot.exists()) {
                  const bed = bedDocSnapshot.data();
                  bed.id = bedDocSnapshot.id;
                  bedData.push(bed);
                }
              }
            }
    
            const room = {
              id: doc1.id,
              data: {
                ...roomData,
              },
            };
    
            room.data.bed = bedData;
            rooms.push(room);
          }
        
          // Filter rooms based on combinedResult
          const filteredRooms = rooms.filter((room) => {
            return room.data.roomId.includes(combinedResult)
          });

          setRoomList(filteredRooms);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchDataBed();
    }, [floor]);
    
    
    useEffect(() => {
      const fetchDataBed = async () => {
        const collectionRef = collection(db, 'room');
        const rooms = [];
        try {
          const querySnapshot = await getDocs(collectionRef);

          for (const doc1 of querySnapshot.docs){
            const roomData = doc1.data();
            const bedDocRef = roomData.beds;
            const bedData = [];

            if (bedDocRef){
              for (const bedRef of bedDocRef){
                const bedDocSnapshot = await getDoc((doc(db, 'bed', bedRef)));

                if (bedDocSnapshot.exists()){
                  const bed = bedDocSnapshot.data(); 
                  bed.id = bedDocSnapshot.id;
                  bedData.push(bed);
                }
              }
            }

            const room = {
              id: doc1.id,
              data: {
                ...roomData,
              },
            };

            room.data.bed = bedData;
            rooms.push(room);
          }
          setRoomList(rooms);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchDataBed();
    }, []);

    useEffect(() => {
      if(refreshList){
        const fetchDataBed = async () => {
          const collectionRef = collection(db, 'room');
          const rooms = [];
          try {
            const querySnapshot = await getDocs(collectionRef);

            for (const doc1 of querySnapshot.docs){
              const roomData = doc1.data();
              const bedDocRef = roomData.beds;
              const bedData = [];

              if (bedDocRef){
                for (const bedRef of bedDocRef){
                  const bedDocSnapshot = await getDoc((doc(db, 'bed', bedRef)));

                  if (bedDocSnapshot.exists()){
                    const bed = bedDocSnapshot.data(); 
                    bed.id = bedDocSnapshot.id;
                    bedData.push(bed);
                  }
                }
              }

              const room = {
                id: doc1.id,
                data: {
                  ...roomData,
                },
              };

              room.data.bed = bedData;
              rooms.push(room);
            }
            setRoomList(rooms);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        fetchDataBed();
        setRefreshList(false)
      }
    }, [refreshList]);

    useEffect(() => {
      if(selectedPatientIdpatientDetail){
        const fetchDatapatient = async () => {
          const docRef = doc(collection(db, 'patients'), selectedPatientIdpatientDetail);
          
          try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              // Process the retrieved data as needed
              const dob = data.dob; // Assuming 'dob' is the field in the Firestore document that stores the DOB
              const currentDate = new Date();
              const parsedDOB = parse(dob, 'yyyy-MM-dd', new Date());
              const age = differenceInYears(currentDate, parsedDOB);

              // Store the data with age in state
              setDataPatient({
                ...data,
                age: age,
              });
            } else {
              console.log('No document found with the provided ID');
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        fetchDatapatient();
        setRefreshList(false)
      }
    }, [selectedPatientIdpatientDetail]);

    useEffect(() => {
      if(selectedPatientIdpatientDetail){
        const fetchDataJob = async () => {
          const queryRef = query(
            collection(db, 'job'),
            where('bed', '==', selectedBedNumberpatientDetail),
            where('patient', '==', selectedPatientIdpatientDetail),
            where('room', '==', selectedRoomIdpatientDetail)
          );
          
          try {
            const querySnapshot = await getDocs(queryRef);
            if (!querySnapshot.empty) {
              const data = querySnapshot.docs.map((doc) => doc.data());
              const staffField = data.map((item) => item.staff);
              const firstStaff = staffField[0];
              setSelectedDoctorIdForPatientDetail(firstStaff);
            } else {
              console.log('No documents found with the provided criteria');
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        fetchDataJob();
        setRefreshList(false)
      }
    }, [selectedPatientIdpatientDetail]);

    useEffect(() => {
      if(selectedDoctorIdForPatientDetail){
        const fetchDatapatient = async () => {
          const docRef = doc(collection(db, 'users'), selectedDoctorIdForPatientDetail);
          
          try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              // Process the retrieved data as needed
              
              // Store the data with age in state
              setSelectedDoctorNameForPatientDetail(data.name);
            } else {
              console.log('No document found with the provided ID');
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        fetchDatapatient();
        setRefreshList(false)
      }
    }, [selectedDoctorIdForPatientDetail]);

    const handleClick = async (roomId) => {
      setSelectedRoom(roomId)
      setOpen(true);
    };

    const handleClickDetail = async (roomId) => {
      setSelectedRoomForJob(roomId)
      setOpenDetail(true);
    };

    const handleClickDetailBed = async (patientId, bedNumber, roomId, bedStatus) => {
      setSelectedPatientIdpatientDetail(patientId)
      setSelectedBedNumberpatientDetail(bedNumber)
      setSelectedRoomIdpatientDetail(roomId)
      setSelectededBedStatuspatientDetail(bedStatus)
      setOpenBedDetail(true)
    };

    const handleCloseBedDetail = async () => {
      setSelectedPatientIdpatientDetail("")
      setDataPatient('')
      setOpenBedDetail(false);
    };

    const getBedDocumentId = async (collectionName) => {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef, 
        where('roomId', '==', selectedRoomIdpatientDetail), 
        where('number', '==', selectedBedNumberpatientDetail)
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

    const getRoomDocumentId = async (collectionName) => {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef, 
        where('roomId', '==', selectedRoomIdpatientDetail), 
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

    const setBedCountDetail = async (roomuid) => {
      const roomDocRef = doc(db, 'room', roomuid);
      
      try {
        const roomDocSnap = await getDoc(roomDocRef);
        if (roomDocSnap.exists()) {
          const currentBedCount = roomDocSnap.data().bedCount || 0;
          const updatedBedCount = currentBedCount - 1;
          
          await updateDoc(roomDocRef, { bedCount: updatedBedCount });
          
        }
      } catch (error) {
        console.error('Error updating bed count:', error);
      }
    };

    const handleCloseRemoveBed = async () => {
      getBedDocumentId('bed').then(async (bedId) => {
        if (bedId) {
            console.log(bedId)
            const docRef = doc(db, 'bed', bedId);
            await deleteDoc(docRef);  
            getRoomDocumentId('room').then(async (roomId) => {
              if (roomId) {
                const roomRef = doc(db, 'room', roomId);
      
                try {
                  await updateDoc(roomRef, {
                    beds: arrayRemove(bedId),
                  });
      
                } catch (error) {
                  console.error('Error deleting data field:', error);
                }   
                setBedCountDetail(roomId)

              }
            });
            const date = new Date().toISOString().split('T')[0];
            insertJob("Removing Bed", "", "", date, date, selectedRoomIdpatientDetail, selectedBedNumberpatientDetail, "Cleaning Service", "Unfinished")
            setRefreshList(true)
        }
      });
      enqueueSnackbar('Success Remove Bed!', { variant: 'success' });    
      setSelectedPatientIdpatientDetail("")
      setDataPatient('')
      setOpenBedDetail(false);
      setRefreshList(true)
    };

    const handleCloseDetail = async () => {
      setOpenDetail(false);
    };

    const handleClose = () => {
      setError({ bed: "" })
      setBed("")
      setOpen(false);
    };

    const fetchDataUID = async (collectionName, fieldName, fieldValue) => {
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

    const fetchDataBedUID = async (collectionName, roomId, roomNumber) => {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, 
        where('roomId', '==', roomId),
        where('number', '==', roomNumber)
      );
    
      try {
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
          // Assuming there is only one document with the specified roomId and roomNumber
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

    const addDataToRoomArray = async (roomuid, beduid) => {
      const roomRef = doc(db, 'room', roomuid);
    
      try {
        await updateDoc(roomRef, {
          beds: arrayUnion(beduid)
        });

      } catch (error) {
        console.error('Error adding data to the array field:', error);
      }
    };

    const setBedCount = async (roomuid) => {
      const roomDocRef = doc(db, 'room', roomuid);
      
      try {
        const roomDocSnap = await getDoc(roomDocRef);
        if (roomDocSnap.exists()) {
          const currentBedCount = roomDocSnap.data().bedCount || 0;
          const updatedBedCount = currentBedCount + 1;
          
          await updateDoc(roomDocRef, { bedCount: updatedBedCount });
          
        }
      } catch (error) {
        console.error('Error updating bed count:', error);
      }
    };

    const handleCloseAdd = () => {
      let isValid = true;
      let errors = { bed: "" };
  
      if (bed.trim().length < 1) {
          isValid = false;
          errors.bed = "Bed Number must be filled.";
      }

      setError(errors);
  
      if(isValid){
          setOpen(false);
          insertBed(bed, "Unusable", "", selectedRoom);
          fetchDataUID('room', 'roomId', selectedRoom).then((roomuid) => {
            if (roomuid) {
              fetchDataBedUID('bed', selectedRoom, bed).then((beduid) => {
                if (beduid) {
                  addDataToRoomArray(roomuid, beduid);
                  setBedCount(roomuid);
                  const date = new Date().toISOString().split('T')[0];
                  const storedId = localStorage.getItem('id');

                  insertJob("Cleaning New Bed", "", "", date, date, selectedRoom, bed, "Cleaning Service", "Unfinished")
                  insertNotification("New Assigned Job", "Cleaning New Bed", date, storedId)
                  setRefreshList(true);
                }
              });
            }
          });
          enqueueSnackbar('Success Add New Bed!', { variant: 'success' });    
        }
    };

    const handleSearchQueryChange = (event) => {
      setSearchQuery(event.target.value);
    };

    useEffect(() => {
      const filtered = roomList.filter((room) => {
        const itemName = room.data.roomId || ''; 
        const search = searchQuery || ''; 
        return itemName.toLowerCase().includes(search.toLowerCase());
      });
      
      setFilteredData(filtered);
    }, [searchQuery, roomList]);

    const columns: GridColDef[] = [
      { field: 'id', headerName: 'ID', width: 280 },
      {
        field: 'Status',
        headerName: 'Status',
        width: 150,
        editable: true,
      },
      {
        field: 'Category',
        headerName: 'Category',
        width: 180,
        editable: true,
      },
      {
          field: 'Patient',
          headerName: 'Patient',
          width: 180,
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
        width: 130,
        editable: true,
      },
      {
        field: 'Staff',
        headerName: 'Staff',
        width: 180,
        editable: true,
      },
  ];

  useEffect(() => {    
    // Define a function to fetch the data from Firestore
    const fetchData = async () => { 
      const collectionRef = collection(db, 'job');

      try {
        const querySnapshot = await getDocs(collectionRef);

        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
      })).filter((job) => job.data.room === selectedRoomForJob);
        setData(fetchedData);
      } catch (error) {
          console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedRoomForJob]);

  const handleAddNewRoom = () => {
    setOpenNewRoom(true)
  };

  const handleCloseNewRoom = async () => {
    setRoomType('')
    setRoomCapacity(0)
    setRoomId('')
    setErrorRoom({ room: "", roomType: "", roomCapacity: "" })
    setOpenNewRoom(false);
  };

  const handleClickNewRoom = () => {
    let isValid = true;
    let errors = { room: "", roomType: "", roomCapacity: "" };
    const regex = /^[A-C][1-9][0-9]{3}$/;

    if (!regex.test(roomId)) {
      isValid = false;
      errors.room = "Invalid room number.";
    }

    if (roomType.trim().length < 1) {
      isValid = false;
      errors.roomType = "Room Type must be filled.";
    }

    setErrorRoom(errors);

    if(isValid){
        setOpenNewRoom(false);
        insertRoom(roomId, 0, roomCapacity, roomType);
        enqueueSnackbar('Success Add New Room!', { variant: 'success' });    
        setRefreshList(true)
    }
  };

    return (
        <SnackbarProvider maxSnack={1}>
            <HomeMenu>
                <Typography variant="h4" gutterBottom>
                    Room
                </Typography>
                <Box marginTop={2} marginBottom={3} width={300}>
                  <div>
                    {role === "Administration Staff" && (
                      <Button variant="contained" color="primary" onClick={handleAddNewRoom} fullWidth>
                        Create New Room
                      </Button>
                    )}
                  </div>
                    
                </Box>
                <Dialog open={openNewRoom} onClose={handleCloseNewRoom} aria-labelledby="form-dialog-title">
                <DialogTitle>
                    New Room
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
                            helperText={errorRoom.room}
                            error={errorRoom.room.length > 0}
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                        <FormControl fullWidth required margin="normal" error={errorRoom.roomType.length > 0}>
                            <InputLabel>Room Type</InputLabel>
                            <Select labelId="type" id="type" label="Room Type" value={roomType} onChange={handleChangeRoomType}>
                                {dropdownDataRoomType.map((item) => (
                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                ))}
                            </Select>
                            {errorRoom.roomType && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorRoom.roomType}</div>}
                        </FormControl>
                        {roomType && (
                          <FormControl fullWidth required margin="normal" error={errorRoom.roomCapacity.length > 0}>
                            <InputLabel>Room Capacity</InputLabel>
                            <Select labelId="roomCapacity" id="roomCapacity" label="Room Capacity" value={roomCapacity} onChange={handleChangeRoomCapacity}>
                                {dropdownDataRoomCapacity.map((item) => (
                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                ))}
                            </Select>
                            {errorRoom.roomCapacity && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorRoom.roomCapacity}</div>}
                          </FormControl>
                        )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewRoom} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                      Cancel
                    </Button>
                    <Button onClick={handleClickNewRoom} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                      Create
                    </Button>
                </DialogActions>
                </Dialog>
                <Box>
                <TextField
                  label="Search"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  style={{ width: '51%', marginBottom: 15 }}
                />
                <FormControl fullWidth required margin="normal" sx={{ width: '51%', marginBottom: '10px' }}>
                    <InputLabel>Building</InputLabel>
                    <Select labelId="building" id="building" label="Building" value={building} onChange={handleChangeBuilding}>
                        {dropdownDataBuilding.map((item) => (
                            <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {building && (
                  <FormControl fullWidth required margin="normal" sx={{ width: '51%', marginBottom: '10px' }}>
                    <InputLabel>Floor</InputLabel>
                    <Select labelId="floor" id="floor" label="Floor" value={floor} onChange={handleChangeFloor}>
                        {dropdownDataFloor.map((item) => (
                            <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}

                {/* {floor && ( */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {filteredData.map((room) => (
                      <Card sx={{ backgroundColor: '#9BABB8', borderRadius: '4px', marginBottom: '10px', width: '350px', height: '300px', position: 'relative' }}>
                        <CardContent>
                          <Typography variant="h5" component="div">
                            {room.data.roomId} - {room.data.roomType}
                          </Typography>
                          <div style={{ display: 'flex', flexDirection: 'row' }}>
                            {room.data.bed && room.data.bed.map((bed) => (
                              <div 
                                style={{
                                  backgroundColor:
                                    bed.bedStatus === 'Available' ? 'green' :
                                    bed.bedStatus === 'Unusable' ? 'red' :
                                    bed.bedStatus === 'Filled with patients' ? 'yellow' :
                                    'gray',
                                  borderRadius: '4px',
                                  margin: '10px',
                                  width: '70px',
                                  height: '70px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleClickDetailBed(bed.patient, bed.number, room.data.roomId, bed.bedStatus)}
                              >
                                {bed.number}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                            <Button variant="contained" color="primary" onClick={() => handleClickDetail(room.data.roomId)}>
                                  Job List
                            </Button>
                            <Dialog open={openDetail} onClose={handleCloseDetail} aria-labelledby="form-dialog-title">
                          <DialogTitle>
                              Job List
                          </DialogTitle>
                          <DialogContent>
                          <div style={{ height: 400, width: '100%' }}>
                              <DataGrid
                                  rows={data.map((user) => ({
                                  id: user.id,
                                  Status: user.data.status,
                                  Category: user.data.category,
                                  Patient: user.data.patient,
                                  AssignedDate: user.data.assignedDate,
                                  DueDate: user.data.dueDate,
                                  Room: user.data.room,
                                  Staff: user.data.staff
                                  }))}
                                  columns={columns}
                              />
                          </div>
                          </DialogContent>
                          <DialogActions>
                              <Button onClick={handleCloseDetail} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
                                Close
                              </Button>
                          </DialogActions>
                          </Dialog>
                          {room.data.bedCount < room.data.roomCapacity && role === "Administration Staff" && (
                            <Button variant="contained" color="primary" onClick={() => handleClick(room.data.roomId)} style={{ marginLeft: '10px' }}>
                              Add Bed
                            </Button>
                          )}
                          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                          <DialogTitle>
                              New Bed
                          </DialogTitle>
                          <DialogContent>
                              <TextField
                                  variant="outlined"
                                  margin="normal"
                                  required
                                  fullWidth
                                  id="number"
                                  label="Bed Number"
                                  name="number"
                                  autoFocus
                                  helperText={error.bed}
                                  error={error.bed.length > 0}
                                  value={bed}
                                  onChange={(e) => setBed(e.target.value)}
                              />
                          </DialogContent>
                          <DialogActions>
                              <Button onClick={handleClose} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'red' }}>
                                Cancel
                              </Button>
                              <Button onClick={handleCloseAdd} color="primary" style={{ marginRight: '10px', padding: '10px', color: 'blue' }}>
                                Add
                              </Button>
                          </DialogActions>
                          </Dialog>
                          <Dialog onClose={handleCloseBedDetail} aria-labelledby="customized-dialog-title" open={openBedDetail}>
                          <DialogTitle id="customized-dialog-title">
                            Patient Detail
                          </DialogTitle>
                          {dataPatient && 
                          <DialogContent dividers>
                            <Typography gutterBottom>
                              Name : {dataPatient.name}
                            </Typography>
                            <Typography gutterBottom>
                              Gender : {dataPatient.gender}
                            </Typography>
                            <Typography gutterBottom>
                              Age : {dataPatient.age}
                            </Typography>
                            <Typography gutterBottom>
                              Doctor : {selectedDoctorNameForPatientDetail}
                            </Typography>
                            <Typography gutterBottom>
                              Sickness : {dataPatient.sickness}
                            </Typography>
                          </DialogContent>
                          }
                          <DialogActions>
                            <Button autoFocus onClick={handleCloseBedDetail} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
                              Close
                            </Button>
                            <div>
                              {selectededBedStatuspatientDetail == "Available" && (
                                <Button autoFocus onClick={handleCloseRemoveBed} color="primary" style={{ marginRight: '10px', padding: '10px' }}>
                                  Remove Bed
                                </Button>
                              )}
                            </div>
                          </DialogActions>
                        </Dialog>
                        </div>
                      </Card>                    
                    ))}
                  </div>
                {/* )} */}
                </Box>
            </HomeMenu>
        </SnackbarProvider>
    );
}