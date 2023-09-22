import React, { useState } from 'react';
import Head from 'next/head';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Link from '../components/Link';
import { DialogContentText, Box, styled, FormHelperText } from '@mui/material';
import Router from 'next/router';
import { auth, db } from '../utils/db';
import { collection, doc, getDoc, setDoc } from "firebase/firestore"; 
import {createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "firebase/auth";
import Layout from './master';

const Root = styled('div')(({ theme }) => {
    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: theme.spacing(4),
    };
});

function Login() {
    // const [ id, setId] = useState("");
    // const [password, setPassword] = useState("");
    const [error, setError] = useState({ id: "", password: "" });
    const [noData, setNoData] = useState("");

    const handleLogin = (id: string, password: string) => {
        let isValid = true;
        let errors = { id: "", password: "" };

        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(id.trim())) {
            isValid = false;
            errors.id = "Email validation failed.";
        }

        if (password.trim().length < 6) {
            isValid = false;
            errors.password = "Password must be at least 6 characters long.";
        }

        setError(errors);

        if (isValid) {

            signInWithEmailAndPassword(auth, id, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log(user.uid)
                const docRef = doc(db, 'users', user.uid);

                try {
                    const docSnap = await getDoc(docRef);
                
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const fieldValue = data.role; 
                        const fieldCurrName = data.name; 
                        
                        localStorage.clear();
                        localStorage.setItem("id", user.uid);
                        localStorage.setItem("role", fieldValue);
                        localStorage.setItem("name", fieldCurrName);
                    } else {
                        // Handle the case when the document doesn't exist
                    }
                } catch (error) {
                    // Handle any errors that occur during fetching the document
                    console.error('Error fetching document:', error);
                }
                //Logic setelah berhasil login
                Router.push('/dashboard/homeMenu')
            })
            .catch((error) => {
                //Kalo error mau ngapain
                const errorCode = error.code;
                const errorMessage = error.message;
                setNoData("Invalid Credentials!")
                console.log(errorMessage)
            });
        }
    };

    const handleRegister = () => {
        Router.push('/register')
    }

    return (
       <Layout>
                <Typography variant="h3" gutterBottom>
                    siLVoam Hospital
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Please enter your Email and Password to continue
                </Typography>
                <Box width={1/3} minWidth={240} marginY={2}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="id"
                        label="Email"
                        name="id"
                        // value={id}
                        // onChange={(e) => setId(e.target.value)}
                        helperText={error.id}
                        autoFocus
                        error={error.id.length > 0}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="Password"
                        label="Password"
                        type="password"
                        id="password"
                        // value={password}
                        // onChange={(e) => setPassword(e.target.value)}
                        helperText={error.password}
                        error={error.password.length > 0}
                    />
                    <Typography variant="body1" color="error">
                        {noData}
                    </Typography>
                    <Box marginTop={2}>
                        <Button variant="contained" color="secondary" onClick={()=>{handleLogin((document.getElementById("id") as HTMLInputElement).value, 
                        (document.getElementById("password") as HTMLInputElement).value)}} fullWidth>
                            Login
                        </Button>
                    </Box>
                    <Box marginTop={2}>
                        <Button color="success" onClick={handleRegister} fullWidth>
                            Register
                        </Button>
                    </Box>
                </Box>
            </Layout>
    );
};

export default Login;
