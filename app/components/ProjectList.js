// @flow
import React, { Component } from 'react';

type Props = {};

export default class ProjectList extends Component<Props> {
  props: Props;

  render() {
    const data = [
      {
        "name": "Testproject 1",
        "path": "C:\\Users\\Michi\\Downloads\\abgaben_Blatt1_Rechnerarchitektur"
      },
      {
        "name": "Testproject 2",
        "path": "C:\\Users\\Michi\\Downloads\\abgaben_Blatt2_Rechnerarchitektur"
      },
      {
        "name": "Testproject 3",
        "path": "C:\\Users\\Michi\\Downloads\\abgaben_Blatt3_Rechnerarchitektur"
      }
    ];

    const projects = data.map((item) => <div>{item.name}&emsp;{item.path}</div>);
    return (
      <div>{projects}</div>
    );
  }
}
