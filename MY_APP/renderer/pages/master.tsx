import React, { useState } from 'react';
import Head from 'next/head';
import { styled } from '@mui/material';


export default function Layout({ children }) {
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

    return (
      <>
        {/* <Navbar /> */}
        <React.Fragment>
            <Head>
                <title>siLVoam Hospital</title>
            </Head>
            <Root>
            {children}
            </Root>
        </React.Fragment>
      
        {/* <Footer /> */}
      </>
    )
  }