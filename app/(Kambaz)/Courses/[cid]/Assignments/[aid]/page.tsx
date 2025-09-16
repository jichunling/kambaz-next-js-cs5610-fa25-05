export default function AssignmentEditor() {
  return (
    <div id="wd-assignments-editor">
      <label htmlFor="wd-name">Assignment Name</label>
      <input id="wd-name" value="A1 - ENV + HTML" /><br /><br />
      <textarea id="wd-description">
        The assignment is available online Submit a link to the landing page of
      </textarea>
      <br />
      <table>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-points">Points</label>
          </td>
          <td>
            <input id="wd-points" value={100} />
          </td>
        </tr>
        {/* Complete on your own */}
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-group">Assignment Group</label>
          </td>
          <td>
            <select id="wd-group">
              <option selected value="Assignments">Assignments</option>
              <option value="Quiz">Quiz</option>
              <option value="Project">Project</option>
            </select>
          </td>
        </tr>
        <tr>
           <td align="right" valign="top">
            <label htmlFor="wd-display-grade-as">Display Grade as</label>
           </td>
           <td>
            <select id="wd-display-grade-as">
              <option selected value="Percentages">Percentages</option>
              <option value="Letter-Grade">Letter-Grade</option>
            </select>
          </td>
        </tr>
        <tr>
           <td align="right" valign="top">
            <label htmlFor="wd-submission-type">Submission Type</label>
           </td>
           <td>
            <select id="wd-submission-type">
              <option selected value="Percentages">Online</option>
              <option value="On-Paper">On Paper</option>
            </select>
            <div style={{ marginTop:8}}>
              <div>Online Entry Options</div>
              <input type="checkbox" name="check-entry-options" id="wd-text-entry"/>
              <label htmlFor="wd-text-entry">Text Entry</label><br/>
              <input type="checkbox" name="check-entry-options" id="wd-website-url"/>
              <label htmlFor="wd-website-url">Website URL</label><br/>
              <input type="checkbox" name="check-entry-options" id="wd-media-recording"/>
              <label htmlFor="wd-media-recording">Website URL</label><br/>
              <input type="checkbox" name="check-entry-options" id="wd-student-annotation"/>
              <label htmlFor="wd-student-annotation">Student Annotation</label><br/>
              <input type="checkbox" name="check-entry-options" id="wd-file-upload"/>
              <label htmlFor="wd-file-upload">File Upload</label><br/>   
            </div>
          </td>
        </tr>

       <tr>
        <td align="right" valign="top">
          <label>Assign</label>
        </td>
        <td>
          <div>
            <label htmlFor="wd-assign-to">Assign to</label><br />
            <input id="wd-assign-to" type="text" value="Everyone" /><br /><br />
            <label htmlFor="wd-due-date">Due</label><br />
            {/* use datetime-local so it can show date + time like in the screenshot */}
            <input id="wd-due-date" type="date" value="2024-05-13" /><br /><br />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label htmlFor="wd-available-from">Available from</label><br />
                <input id="wd-available-from" type="date" value="2024-05-06" />
              </div>
              <div>
                <label htmlFor="wd-available-until">Until</label><br />
                <input id="wd-available-until" type="date" value="2024-05-16"/>
              </div>
            </div>
          </div>
        </td>
      </tr>
      </table>
    </div>
);}



