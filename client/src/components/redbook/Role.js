import React from 'react'

const Role = (props) => {

  const d = props.d

  if (d.role === "STUDENT") {
    return (
        <div className = "role-container">
          <p> Studying {d.programs} </p>
          <p> @ {d.campus} </p>
        </div>
    );
  }
  else if (d.role === "ALUMNI") {
    return (
        <div className = "role-container">
          <p> {d.current_job} </p>
          <p> @ {d.job_location} </p>
        </div>
    );
  }
  else if (d.role === "STAFF") {
    return (
        <div className = "role-container">
          <p> Teaching {d.programs} </p>
          <p> @ {d.campus} </p>
        </div>
    );
  }

}

export default Role