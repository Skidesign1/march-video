"use client"
import React from "react";
import { useParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { StoreProvider } from "@/store";
import { StoreContext } from "@/store";
import { Store } from "@/store/Store";
import { Editor } from "../../../components/Editor";
import dynamic from 'next/dynamic'

const DynmicEditor = dynamic(() => import('../../../components/Editor').then(a => a.EditorWithStore), {
  ssr: false,
})


function EditorPage() {

    
  
    const params = useParams()
    const searchParams = useSearchParams()
    const userId = searchParams.get('userId')
    const token = searchParams.get('token')
    if (token&&typeof window !== 'undefined') {
      window.sessionStorage.setItem('token', token);
    }
    if (userId &&typeof window !== 'undefined') {
      window.sessionStorage.setItem('userId', userId);
    }
    if (params.templateId &&typeof window !== 'undefined') {
      window.sessionStorage.setItem('templateId', params.templateId);
    }
  
    useEffect(() => {
      
  
      const userId = window.sessionStorage.getItem('userId');
      const fetchUserInfo = async () => {
        try {
          const token = window.sessionStorage.getItem('token');
  
          // Check if token exists
          if (!token) {
            // Handle case where token is not available
            console.error('Token not found in session.');
            return;
          }
  
          // Define request headers with Authorization header containing the token
          const config = {
            headers: {
              Authorization: `${token}`,
            },
          };
  
          // Make a POST request to fetch user info using the provided id
          const response = await axios.get(`https://skyestudio-backend.onrender.com/user/profile`, config);
          console.log(response)
          
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
  
      // if (params.templateId) {
      //   fetchTemplateInfo();
      // }
  
      if (userId) {
        fetchUserInfo();
      }
    }, [params.templateId, userId]);
  

  return (
    <DynmicEditor />
  );


}
EditorPage.diplsayName = "EditorPage";

export default EditorPage;

