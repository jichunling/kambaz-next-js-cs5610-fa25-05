"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { Form, Button, FormControl } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "../reducer";
import { useRouter } from "next/navigation";
import * as client from "../client";

//Copy global currentUser to local profile state variable for editing

export default function Profile() {
  const [profile, setProfile] = useState<any>({});
  const dispatch = useDispatch();
  const router = useRouter();
  // Access to dispatcher only; profile is fetched from server session
  useSelector((state: any) => state.accountReducer); // ensure store subscription (no direct usage)
  const fetchProfile = useCallback(async () => {
    try {
      // Use POST /api/users/profile to retrieve the session user
      const serverProfile = await client.profile();
      setProfile(serverProfile);
      dispatch(setCurrentUser(serverProfile));
    } catch {
      // If not authenticated, redirect to Signin
      router.push("/Kambaz/Account/Signin");
    }
  }, [dispatch, router]);
  const updateProfile = async () => {
    const updatedProfile = await client.updateUser(profile);
    setProfile(updatedProfile);
    dispatch(setCurrentUser(updatedProfile));
  };


  const signout = async () => {
    await client.signout();           //1. tell the server first
    dispatch(setCurrentUser(null));   //2. clear out locally
    router.push("/Kambaz/Account/Signin");
  };
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div id="wd-profile-screen">
      <h1>Profile</h1>
      {profile && (
        <div>
          <FormControl value={profile.username || ""} id="wd-username" className="mb-2"
            onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          <FormControl value={profile.password || ""} id="wd-password" className="mb-2"
            onChange={(e) => setProfile({ ...profile, password: e.target.value })} />
          <FormControl value={profile.firstName || ""} id="wd-firstname" className="mb-2"
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
          <FormControl value={profile.lastName || ""} id="wd-lastname" className="mb-2"
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
          <FormControl value={profile.dob ? String(profile.dob).substring(0, 10) : ""} id="wd-dob" className="mb-2"
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })} type="date" />
          <FormControl value={profile.email || ""} id="wd-email" className="mb-2"
            onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <select value={profile.role || "USER"} onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            className="form-control mb-2" id="wd-role">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="FACULTY">Faculty</option>
            <option value="STUDENT">Student</option>
          </select>
          <button className="btn btn-primary" onClick={updateProfile}>Update</button>

          <Button onClick={signout} className="mb-2 btn btn-danger float-end" id="wd-signout-btn">
            Sign out
          </Button>
          <Button onClick={() => dispatch(setCurrentUser(profile))}>Save</Button>
        </div>
      )}


      {/* <Form.Control id="wd-username" placeholder="username" className="mb-2" />
      <Form.Control id="wd-password" placeholder="123" type="password" className="mb-2" />
      <Form.Control id="wd-firstName" placeholder="Alice" className="mb-2" />
      <Form.Control id="wd-lastName" placeholder="Wonderland" className="mb-2" />
      <Form.Control id="wd-date" type="date" className="mb-2" />
      <Form.Control id="wd-email" placeholder="alice@@wonderland" type="email" className="mb-2" />
      <Form.Control id="wd-role" placeholder="user" className="mb-2" />
      <Link id="wd-signup-btn" href="/Account/Profile" className="btn btn-primary w-100 mb-2">
        Signout </Link> */}


      {/* <h3>Profile</h3>
      <img id="wd-defaultProfileImage" src="/images/defaultProfileImage.jpg" 
      alt="Profile photo"
      width={56}
      height={56}
      className="rounded-full object-cover" /><br/>

      <input defaultValue="alice" placeholder="username"/><br/>
      <input defaultValue="123"   placeholder="password" type="password" /><br/>
      <input defaultValue="Alice" placeholder="First Name" /><br/>
      <input defaultValue="Wonderland" placeholder="Last Name" /><br/>
      <input defaultValue="2000-01-01" type="date" id="wd-dob" /><br/>
      <input defaultValue="alice@wonderland" type="email" id="wd-email" /><br/>
      <select defaultValue="FACULTY" id="wd-role">
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
        <option value="FACULTY">Faculty</option>
        <option value="STUDENT">Student</option>
      </select><br/>
      <select defaultValue="Undergraduate" id="wd-role">
        <option value="Undergraduate">Undergraduate</option>
        <option value="Graduate">Graduate</option>
      </select><br/>
      
      <Link href="Signin" > Sign out </Link> */}
    </div>
  );
}
