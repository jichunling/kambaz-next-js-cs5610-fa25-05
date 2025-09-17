import Link from "next/link";
import Image from "next/image";
export default function Dashboard() {
  return (
    <div id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard</h1> <hr />
      <h2 id="wd-dashboard-published">Published Courses (12)</h2> <hr />
      <div id="wd-dashboard-courses">
        <div className="wd-dashboard-course">
          <Link href="/Courses/1234" className="wd-dashboard-course-link">
            <Image src="/images/reactjs.jpg" alt="" width={200} height={150} />
            <div>
              <h5> CS5610 React JS </h5>
              <p className="wd-dashboard-course-title">
                Full Stack software developer</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
        <div className="wd-dashboard-course">
          <Link href="/Courses/6180" className="wd-dashboard-course-link">
            <Image src="/images/genAI.jpeg" alt="" width={200} height={150} />
            <div>
              <h5> CS6180 Foundation of Generative AI </h5>
              <p className="wd-dashboard-course-title">
                Generative AI is everywhere</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
        <div className="wd-dashboard-course">
          <Link href="/Courses/5200" className="wd-dashboard-course-link">
            <Image src="/images/database.jpeg" alt="" width={200} height={150} />
            <div>
              <h5> CS5200 Database Management </h5>
              <p className="wd-dashboard-course-title">
                SQL or NOSQL</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
       <div className="wd-dashboard-course">
          <Link href="/Courses/5800" className="wd-dashboard-course-link">
            <Image src="/images/algorithm.png" alt="" width={200} height={150} />
            <div>
              <h5> CS5800 Algorithm </h5>
              <p className="wd-dashboard-course-title">
                Learn Algorithm First</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
        <div className="wd-dashboard-course">
          <Link href="/Courses/5520" className="wd-dashboard-course-link">
            <Image src="/images/MobileApp.png" alt=""width={200} height={150} />
            <div>
              <h5> CS5520 Mobile Application Development </h5>
              <p className="wd-dashboard-course-title">
                Android or IOS?</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
        <div className="wd-dashboard-course">
          <Link href="/Courses/5002" className="wd-dashboard-course-link">
            <Image src="/images/DiscreteMath.jpeg" alt="" width={200} height={150} />
            <div>
              <h5> CS5002 Discrete Math </h5>
              <p className="wd-dashboard-course-title">
                I love DiscreteMath</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
        <div className="wd-dashboard-course">
          <Link href="/Courses/5004" className="wd-dashboard-course-link">
            <Image src="/images/OOP.png" alt="" width={200} height={150} />
            <div>
              <h5> CS5004 Object Oriented Programming </h5>
              <p className="wd-dashboard-course-title">
                Hello OOP</p>
              <button> Go </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
);}
