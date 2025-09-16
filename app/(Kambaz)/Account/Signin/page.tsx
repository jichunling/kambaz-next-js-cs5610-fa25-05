import Link from "next/link";


export default function Signin() {
 return (
   <div id="wd-signin-screen">
     <h3>Sign in</h3>
     <input placeholder="username" /> <br />
     <input placeholder="password" type="password" />
     <br />
     <input type="checkbox" name="check-remember" id="wd-chkbox-remember"/>
            <label htmlFor="wd-chkbox-remember">Remember me</label><br/>  
     <Link href="/ForgetPassword"> Forget Password </Link> <br />
     <Link href="/Profile"> Sign in </Link> <br />
     <Link href="Signup"> Sign up </Link>
   </div>
);}
