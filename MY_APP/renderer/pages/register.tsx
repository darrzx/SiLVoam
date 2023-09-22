
import React, { useState } from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import Layout from './master';
import Router from 'next/router';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/db';

async function insertStaff(name: string, email: string, password: string, role: string){
    const staffRef = collection(db, "registerrequest");
    await setDoc(doc(staffRef), {
        name: name, email: email, password: password, role: role});
}

export default function Register() {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState({ name: "", email: "", password: "", role: "" });
    const [role, setRole] = useState('');

    const handleChange = (event) => {
        setRole(event.target.value);
    };

    const handleLogin = () => {
        Router.push('/login')
    }

    const handleRegister = (name: string, email: string, password: string) => {
        let isValid = true;
        let errors = { name: "", email: "", password: "", role: "" };

        if (name.trim().length < 5) {
            isValid = false;
            errors.name = "Name must be at least 5 characters long.";
        }

        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
            isValid = false;
            errors.email = "Email validation failed.";
        }

        if (password.trim().length < 6) {
            isValid = false;
            errors.password = "Password must be at least 6 characters long.";
        }

        if (role.trim().length < 1) {
            isValid = false;
            errors.role = "Role must be filled.";
        }

        setError(errors);
        if(isValid){
            insertStaff(name, email, password, role);
            Router.push('/login')
        }
        
    }

    return (
       <Layout>
                <Typography variant="h3" gutterBottom>
                    siLVoam Hospital
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Register
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Please enter your Credentials
                </Typography>
                <Box width={1/3} minWidth={240} marginY={2}>
                    <FormControl variant="outlined" fullWidth required margin="normal"
                            error={error.role.length > 0}>
                            <InputLabel id="demo-simple-select-outlined-label">Role</InputLabel>
                            <Select labelId="role" id="role" label="Role" value={role} onChange={handleChange}>
                            <MenuItem value="Doctor">Doctor</MenuItem>
                            <MenuItem value="Nurse">Nurse</MenuItem>
                            <MenuItem value="Pharmacist">Pharmacist</MenuItem>
                            <MenuItem value="Administration staff">Administration staff</MenuItem>
                            <MenuItem value="Kitchen staff">Kitchen staff</MenuItem>
                            <MenuItem value="Cleaning Service">Cleaning Service</MenuItem>
                            <MenuItem value="Ambulance Driver">Ambulance Driver</MenuItem>
                        </Select>
                        {error.role && <div style={{ color: 'red', fontSize: '12px', marginLeft: '12px' }}>{error.role}</div>}
                    </FormControl>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Staff Name"
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
                        label="Staff Email"
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
                        type="password"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        name="password"
                        helperText={error.password}
                        error={error.password.length > 0}
                        // autoFocus
                        // value={password}
                        // onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <Box marginTop={2}>
                        <Button variant="contained" color="secondary" onClick={()=>{handleRegister((document.getElementById("name") as HTMLInputElement).value, 
                        (document.getElementById("email") as HTMLInputElement).value,
                        (document.getElementById("password") as HTMLInputElement).value)}} fullWidth>
                            Register
                        </Button>
                    </Box>
                    <Box marginTop={2}>
                        <Button color="success" onClick={handleLogin} fullWidth>
                            Login
                        </Button>
                    </Box>
                </Box>
            </Layout>
    );

}