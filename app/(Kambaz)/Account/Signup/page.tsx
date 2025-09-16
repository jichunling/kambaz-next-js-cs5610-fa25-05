import Link from "next/link";
export default function Signup() {
  return (
    <div id="wd-signup-screen">
      <h3>Sign up</h3>
      <input placeholder="username" /><br/>
      <input placeholder="email" /><br/>
      <input placeholder="password" type="password" /><br/>
      <input placeholder="verify password" type="password" /><br/>
      <input type="checkbox" name="check-term-privacy" id="wd-chkbox-term-privacy"/>
            <label htmlFor="wd-chkbox-term-privacy">Terms & Privacy</label><br/>
      <input type="checkbox" name="check-receive-email" id="wd-chkbox-receive-email"/>
            <label htmlFor="wd-chkbox-receive-email">Would you like to receive Marketing emails? </label><br/>
      
      
      <Link href="Profile" > Profile </Link><br />
      <Link href="Signin" >Sign in</Link>
    </div>
);}
