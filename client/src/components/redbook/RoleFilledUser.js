import React from 'react'
import Role from "./Role"
import { Card, Button, Avatar } from "@material-ui/core";
import { useMutation } from 'react-apollo-hooks';
import { ADD_CONVERSATION_MUTATION } from '../../graphql-queries/mutations'


const RoleFilledUser = (props) => {

  const addConversation = useMutation(ADD_CONVERSATION_MUTATION);


  const d = props.data
  let initials = d.fullname.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

  console.log(d)

  return (
    <div className = "overall-cards-container">
      <Avatar className = "avatar redbook"> {initials} </Avatar>
      <Card className = "info-cards-container">
        <div className = "information-container">
          <h2 className = "name"> {d.fullname} </h2>
          <Role d = {d} />
          <Button
            onClick = {() => {
              addConversation({
                variables: {user_id_2: (+d.id)}
              })
            }}
            className= "message button"
            variant="contained"
          >
            Message
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default RoleFilledUser