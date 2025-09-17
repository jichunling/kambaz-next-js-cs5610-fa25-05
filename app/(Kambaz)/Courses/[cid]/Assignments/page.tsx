import Link from "next/link";

export default function Assignments() {
  return (
    <div id="wd-assignments">
      <input placeholder="Search for Assignments"
             id="wd-search-assignment" />
      <button id="wd-add-assignment-group">+ Group</button>
      <button id="wd-add-assignment">+ Assignment</button>
      <h3 id="wd-assignments-title">
        ASSIGNMENTS 40% of Total <button>+</button> </h3>
      <ul id="wd-assignment-list">
        <li className="wd-assignment-list-item">
          <a href="/Courses/1234/Assignments/123"
             className="wd-assignment-link" >
            A1 - ENV + HTML
          </a><br />
          Mutiple Modules | Not avaiable until May 6 at 12:00am | <br />
          Due May 13 at 11:59pm | 100 pts</li>
        <li className="wd-assignment-list-item">
          {/* Complete On Your Own */}
          <Link href="Course/1234/Assignments/124" className="wd-assignment-link">
          A2 - CSS + BOOTSTRAP
          </Link><br />
          Mutiple Modules | Not avaiable until May 6 at 12:00am | <br />
          Due May 13 at 11:59pm | 100 pts</li>
        <li className="wd-assignment-list-item">
          {/* Complete On Your Own */}
          <Link href="Course/1234/Assignments/125" className="wd-assignment-link">
          A3 - JAVASCRIPT + REACT
          </Link><br />
          Mutiple Modules | Not avaiable until May 6 at 12:00am | <br />
          Due May 13 at 11:59pm | 100 pts</li>
      </ul>
    </div>
);}
