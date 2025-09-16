import Link from "next/link";
export default function Profile() {
  return (
    <div id="wd-profile-screen">
      <h3>Profile</h3>
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
      
      <Link href="Signin" > Sign out </Link>
    </div>
);}
