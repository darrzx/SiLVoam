import React, { useState } from 'react';
import { useEffect } from "react";
import HomeMenu from './homeMenu';
import Button from '@mui/material/Button';
import { Avatar, Box, Dialog, DialogContent, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import { collection, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/db';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { enqueueSnackbar, SnackbarProvider, useSnackbar } from 'notistack';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogActions from '@mui/material/DialogActions';

async function insertPatient(name: string, email: string, phone: string, gender: string, address: string, dob: Date, sickness: string){
  const staffRef = collection(db, "patients");
  await setDoc(doc(staffRef), {
      name: name, email: email, phone: phone, gender: gender, address: address, dob: dob, sickness: sickness});
}

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  paramUpdate: any;
  setRefreshList: any;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sickness, setSickness] = useState("");
  const [errorUpdate, setErrorUpdate] = useState({ name: "", email: "", phone: "", address: "", gender: "", dob: "", sickness: "" });
  const [valueGender, setValueGender] = React.useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const { onClose, selectedValue, open, paramUpdate, setRefreshList } = props;

  const handleCloseDialog = () => {
    setName('')
    setEmail('')
    setPhone('')
    setValueGender('');
    setAddress('')
    setSelectedDate(new Date().toISOString().split('T')[0])
    setErrorUpdate({ name: "", email: "", phone: "", address: "", gender: "", dob: "", sickness: "" })
    onClose(selectedValue);
  };

  const handleCloseUpdate = async () => {

    let isValid = true;
    let errors = { name: "", email: "", phone: "", address: "", gender: "", dob: "", sickness: "" };

    if (name.trim().length < 5) {
        isValid = false;
        errors.name = "Name must be at least 5 characters long.";
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
        isValid = false;
        errors.email = "Email validation failed.";
    }

    if (phone.trim().length < 12) {
        isValid = false;
        errors.phone = "Phone Number must be at least 12 characters long.";
    }

    if (address.trim().length < 10) {
        isValid = false;
        errors.address = "Address must be at least 10 characters long.";
    }

    if(!valueGender){
      isValid = false;
      errors.gender = "Gender must be filled.";
    }

    if (sickness.trim().length < 1) {
      isValid = false;
      errors.sickness = "Sickness must be filled.";
    }
    
    if(!selectedDate || selectedDate == new Date().toISOString().split('T')[0]){
      isValid = false;
      errors.dob = "DOB must be filled.";
    }

    setErrorUpdate(errors);
    if(isValid){
      onClose(selectedValue);
      const { id, namerow, emailrow, phonerow, genderrow, addressrow, dobrow } = paramUpdate;

      const collectionRef = collection(db, 'patients');
      const snapshot = await getDocs(collectionRef);
      
      snapshot.forEach(async (document)  => {
        if(document.id == id){
          const updatedData = {
            name: name,
            email: email,
            phone: phone,
            gender: valueGender,
            address: address,
            dob: selectedDate,
            sickness: sickness
        };
        
            const userDocRef = doc(getFirestore(), 'patients', id);
            await updateDoc(userDocRef, updatedData);
            enqueueSnackbar('Success Update Patient Detail!', { variant: 'success' });
            setRefreshList(true);
        }
      });
    }
    setName('')
    setEmail('')
    setPhone('')
    setValueGender('');
    setAddress('')
    setSelectedDate(new Date().toISOString().split('T')[0])
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // SET VALUE GENDER 
    setValueGender((event.target as HTMLInputElement).value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date.target.value);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Update Patient Detail</DialogTitle>
              <DialogContent>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Patient Name"
                        name="name"
                        autoFocus
                        helperText={errorUpdate.name}
                        error={errorUpdate.name.length > 0}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Patient Email"
                        name="email"
                        helperText={errorUpdate.email}
                        error={errorUpdate.email.length > 0}
                        // autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Phone"
                        name="phone"
                        helperText={errorUpdate.phone}
                        error={errorUpdate.phone.length > 0}
                        // autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <FormControl component="fieldset" error={errorUpdate.gender.length > 0}>
                      <FormLabel component="legend" style={{ marginLeft: '10px' }}>Gender</FormLabel>
                      <RadioGroup
                        aria-label="gender"
                        name="gender1"
                        value={valueGender}
                        onChange={handleGenderChange}
                        style={{ display: 'flex', flexDirection: 'row' }}
                      >
                        <FormControlLabel
                          value="Male"
                          control={<Radio />}
                          label="Male"
                          style={{ marginLeft: '5px' }} // Apply the left margin
                        />
                        <FormControlLabel
                          value="Female"
                          control={<Radio />}
                          label="Female"
                          style={{ marginLeft: '5px' }} // Apply the left margin
                        />
                      </RadioGroup>
                      {errorUpdate.gender && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{errorUpdate.gender}</div>}
                    </FormControl>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="address"
                        label="Address"
                        name="address"
                        helperText={errorUpdate.address}
                        error={errorUpdate.address.length > 0}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <TextField
                      id="date"
                      label="DOB"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      style={{ marginTop: '16px' }}
                      value={selectedDate}
                      onChange={handleDateChange}
                      helperText={errorUpdate.dob}
                      error={errorUpdate.dob.length > 0}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="sickness"
                        label="Sickness"
                        name="sickness"
                        helperText={errorUpdate.sickness}
                        error={errorUpdate.sickness.length > 0}
                        value={sickness}
                        onChange={(e) => setSickness(e.target.value)}
                        // autoFocus
                    />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleCloseUpdate} color="primary">
                  Update
                </Button>
              </DialogActions>
            </Dialog>
  );
}

export default function registerPatient(){
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [valueGender, setValueGender] = React.useState('');
  const [ refreshList, setRefreshList ] = useState(false);
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState({ name: "", email: "", phone: "", address: "", dob: "", gender: "", sickness: "" });
  const [selectedRow, setSelectedRow] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]); 
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 220 },
    {
      field: 'Name',
      headerName: 'Name',
      width: 150,
      editable: true,
    },
    {
      field: 'Email',
      headerName: 'Email',
      width: 200,
      editable: true,
    },
    {
      field: 'Phone',
      headerName: 'Phone',
      width: 150,
      editable: true,
    },
    {
      field: 'Gender',
      headerName: 'Gender',
      width: 100,
      editable: true,
    },
    {
      field: 'Address',
      headerName: 'Address',
      width: 300,
      editable: true,
    },
    {
      field: 'DOB',
      headerName: 'DOB',
      width: 150,
      editable: true,
    },
    {
      field: 'actions',
      headerName: '',
      width: 150,
      renderCell: (params) => {
      
        const [open, setOpen] = useState(false);
        const [selectedValue, setSelectedValue] = React.useState();
        const [data, setData] = useState([]);

        const handleCloseNothing = async () => {
          setOpenUpdate(false);
        };
        
        const handleClickUpdate = async () => {
          setSelectedRow(params.row)
          setOpenUpdate(true);
        };

        return (
          <div>
            {role === "Administration Staff" && (
              <Button variant="contained" color="primary" onClick={handleClickUpdate}>
                Update
            </Button>
            )}
          <SimpleDialog setRefreshList={setRefreshList} paramUpdate={selectedRow} selectedValue={selectedValue} open={openUpdate} onClose={handleCloseNothing} />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    // Define a function to fetch the data from Firestore
    const fetchData = async () => {
      const collectionRef = collection(db, 'patients');

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
        const collectionRef = collection(db, 'patients');
  
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

    const handleAddNewPatient = () => {
      setOpen(true);
    };

    const handleClose = () => {    
      setError({ name: "", email: "", phone: "", address: "", dob: "", gender: "", sickness: "" })
      setOpen(false);
      setValueGender('');
    };

    const handleCloseRegister = (name: string, email: string, phone: string, address: string, sickness: string) => {
      let isValid = true;
      let errors = { name: "", email: "", phone: "", address: "", dob: "", gender: "", sickness: "" };

      if (name.trim().length < 5) {
          isValid = false;
          errors.name = "Name must be at least 5 characters long.";
      }

      if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
          isValid = false;
          errors.email = "Email validation failed.";
      }

      if (phone.trim().length < 12) {
          isValid = false;
          errors.phone = "Phone Number must be at least 12 characters long.";
      }

      if (address.trim().length < 10) {
          isValid = false;
          errors.address = "Role must be filled.";
      }

      if(!selectedDate){
        isValid = false;
        errors.dob = "DOB must be filled.";
      }

      if(!valueGender){
        isValid = false;
        errors.gender = "Gender must be filled.";
      }

      if (sickness.trim().length < 1) {
        isValid = false;
        errors.sickness = "Sickness must be filled.";
      } 

      setError(errors);
      if(isValid){
        setOpen(false);
        insertPatient(name, email, phone, valueGender, address, selectedDate, sickness)
        enqueueSnackbar('Success Register New Patient!', { variant: 'success' });
        setRefreshList(true)
      }
      setValueGender('');
    };

    const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // SET VALUE GENDER 
      setValueGender((event.target as HTMLInputElement).value);
    };

    const handleDateChange = (date) => {
      setSelectedDate(date.target.value);
    };

    return (
      <SnackbarProvider maxSnack={1}>
        <HomeMenu>
            <Typography variant="h4" gutterBottom>
                All Patient List
            </Typography>
            <Box marginTop={2} marginBottom={3} width={300}>
              <div>
                {role === "Administration Staff" && (
                  <Button variant="contained" color="primary" onClick={handleAddNewPatient} fullWidth>
                      Register New patient
                  </Button>
                )}
              </div>
            </Box>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Register New Patient</DialogTitle>
              <DialogContent>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Patient Name"
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
                        required
                        fullWidth
                        id="email"
                        label="Patient Email"
                        name="email"
                        helperText={error.email}
                        error={error.email.length > 0}
                        // autoFocus
                        // value={email}
                        // onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Phone"
                        name="phone"
                        helperText={error.phone}
                        error={error.phone.length > 0}
                        // autoFocus
                        // value={password}
                        // onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControl component="fieldset" error={error.gender.length > 0}>
                      <FormLabel component="legend" style={{ marginLeft: '10px' }}>Gender</FormLabel>
                      <RadioGroup
                        aria-label="gender"
                        name="gender1"
                        value={valueGender}
                        onChange={handleGenderChange}
                        style={{ display: 'flex', flexDirection: 'row' }}
                      >
                        <FormControlLabel
                          value="Male"
                          control={<Radio />}
                          label="Male"
                          style={{ marginLeft: '5px' }} // Apply the left margin
                        />
                        <FormControlLabel
                          value="Female"
                          control={<Radio />}
                          label="Female"
                          style={{ marginLeft: '5px' }} // Apply the left margin
                        />
                      </RadioGroup>
                      {error.gender && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.gender}</div>}
                    </FormControl>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="address"
                        label="Address"
                        name="address"
                        helperText={error.address}
                        error={error.address.length > 0}
                        // autoFocus
                    />
                    <TextField
                      id="date"
                      label="DOB"
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
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="sickness"
                        label="Sickness"
                        name="sickness"
                        helperText={error.sickness}
                        error={error.sickness.length > 0}
                        // autoFocus
                    />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary" style={{ color: 'red' }}>
                  Cancel
                </Button>
                <Button onClick={()=>{handleCloseRegister((document.getElementById("name") as HTMLInputElement).value, 
                        (document.getElementById("email") as HTMLInputElement).value,
                        (document.getElementById("phone") as HTMLInputElement).value,
                        (document.getElementById("address") as HTMLInputElement).value,
                        (document.getElementById("sickness") as HTMLInputElement).value)}} color="primary">
                  Register
                </Button>
              </DialogActions>
            </Dialog>
            <TextField
              label="Search"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              style={{ width: '50%', marginBottom: 20 }}
            />
            <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={filteredData.map((user) => ({
                  id: user.id,
                  Name: user.data.name,
                  Email: user.data.email,
                  Phone: user.data.phone,
                  Gender: user.data.gender,
                  Address: user.data.address,
                  DOB: user.data.dob,
              }))}
                columns={columns}
            />
            </div>
        </HomeMenu>
        </SnackbarProvider>
    );
}