/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import AceEditor from 'react-ace';
import YAML from 'yaml';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core';

import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import TaskSchemeList from './TaskSchemeList';
import {
  isSubmissionFromSheet,
  saveSubmissions,
  sumParam,
} from '../../utils/FileAccess';

export default function SchemeGenerator(props: any) {
  const { sheets, submissions, reload } = props;
  const [schema, setSchema] = useState([]) as any;
  const [taskCounter, setTaskCounter] = useState(0) as any;
  const [selected, setSelected] = useState({}) as any;
  const [, setOpen] = useState(false) as any;
  const [openDialog, setOpenDialog] = useState(false) as any;
  const [, setMessage] = useState('Test Message') as any;

  const defaultTask = {
    id: taskCounter,
    name: `Task ${taskCounter + 1}`,
    max: '0',
    value: '0',
    type: 'points',
    step: '0.5',
    comment: '',
    tasks: [],
  };

  function addTask(task: any, parent: any) {
    const duplicates = parent?.filter((t: any) => t.name === task.name);
    if (duplicates?.length > 0) {
      throw new Error('');
    }
    if (parent) {
      parent.tasks.push(task);
      setSchema(schema);
    } else {
      setSchema((old: any) => [...old, task]);
    }
  }

  function setTasks(tasks: any) {
    setSchema(tasks);
  }

  function onAddTask() {
    try {
      addTask(defaultTask, null);
      setTaskCounter(taskCounter + 1);
      console.log('Added task');
    } catch (error) {
      console.error(error);
    }
  }

  function clearAllTasks() {
    setSchema([]);
    console.log('All tasks cleared!');
  }

  function fireSnack(msg: string) {
    setMessage(msg);
    setOpen(true);
  }

  function updateTask(tasksArray: any, task: any) {
    for (let i = 0; i < tasksArray.length; i += 1) {
      if (tasksArray[i].id === task.id) {
        tasksArray[i] = task;
        return;
      }
      updateTask(tasksArray[i].tasks, task);
    }
  }

  function deleteTask(tasksArray: any, task: any, parent: any, fullArray: any) {
    for (let i = 0; i < tasksArray.length; i += 1) {
      if (tasksArray[i].id === task.id) {
        tasksArray.splice(i, 1);
        if (tasksArray.length <= 0 && parent) {
          console.log('Restoring parent');
          updateTask(fullArray, {
            ...parent,
            max: '0',
            value: '0',
            type: 'points',
            step: '0.5',
            comment: '',
          });
        }
        fireSnack(`Deleted task "${task.name}"`);
        return;
      }
      deleteTask(tasksArray[i].tasks, task, tasksArray[i], fullArray);
    }
  }

  function onDeleteSelected() {
    const temp = [...schema];
    deleteTask(temp, selected, null, temp);
    setSchema(temp);
  }

  function onAddSubTask() {
    const tempTask = {
      id: selected.id,
      name: selected.name,
      type: selected.type,
      tasks: selected.tasks,
    };
    tempTask.tasks?.push(defaultTask);
    setTaskCounter(taskCounter + 1);
    const temp = [...schema];
    updateTask(temp, tempTask);
    setSchema(temp);
  }

  function onChange(newValue: any) {
    console.log('change', newValue);
    try {
      const tasks = YAML.parse(newValue);
      setSchema(tasks);
    } catch (error) {
      console.log('YAML Parse Error');
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  function onAssignToSheet() {
    const uniqueSheetsForScheme = sheets.filter(
      (s) => s.sheet.grading.max === sumParam(schema, 'max')
    );

    if (uniqueSheetsForScheme.length === 0) {
      alert('No sheets availiable with the same max value');
    } else {
      setOpenDialog(true);
    }
  }

  function handleListItemClick(sheet) {
    setOpenDialog(false);
    const temp: any[] = [];
    submissions.forEach((sub) => {
      if (isSubmissionFromSheet(sub, sheet)) {
        const subT = { ...sub };
        subT.tasks = schema;
        subT.points = sumParam(schema, 'value');
        temp.push(subT);
      } else {
        temp.push(sub);
      }
    });
    saveSubmissions(temp);
    reload();
  }

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      spacing={4}
      style={{ height: 'calc(100% - 45px)', marginTop: '16px' }}
    >
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item style={{ marginLeft: '10px' }}>
          <Typography variant="h3">schema generator</Typography>
        </Grid>
        <Grid item style={{ marginLeft: '10px' }}>
          <Typography variant="h6" display="inline">
            {`total: ${sumParam(schema, 'value')}/${sumParam(
              schema,
              'max'
            )} points`}
          </Typography>
        </Grid>
        <Grid item style={{ marginRight: '10px' }}>
          <ButtonGroup size="small" aria-label="small outlined button group">
            <Button type="button" onClick={onAddTask}>
              Add Task
            </Button>
            <Button
              type="button"
              onClick={onAddSubTask}
              disabled={
                Object.keys(selected).length === 0 &&
                selected.constructor === Object
              }
            >
              Add subtask
            </Button>
            <Button type="button" onClick={onDeleteSelected}>
              Delete selected task
            </Button>
            <Button type="button" onClick={clearAllTasks}>
              Clear Tasks
            </Button>
            <Button type="button" onClick={onAssignToSheet}>
              Assign scheme to sheet
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Grid
        item
        container
        wrap="nowrap"
        style={{ flex: '1 1 0%', height: '0px' }}
      >
        <Grid item xs={8} style={{ flex: '1 1 0%', marginRight: '16px' }}>
          <Paper
            elevation={3}
            style={{
              flex: '1 1 0%',
              height: '0px',
              minHeight: 'calc(100% - 32px)',
              overflow: 'auto',
              padding: '16px',
            }}
          >
            <TaskSchemeList
              tasks={schema}
              setTasks={setTasks}
              selectedTask={selected}
              setSelected={setSelected}
            />
          </Paper>
        </Grid>
        <Grid item xs={4} style={{ flex: '1 1 0%', marginRight: '16px' }}>
          <Paper
            elevation={3}
            style={{
              flex: '1 1 0%',
              height: '0px',
              minHeight: 'calc(100%)',
              overflow: 'auto',
            }}
          >
            <AceEditor
              mode="yaml"
              theme="github"
              width="100%"
              height="100%"
              maxLines={Infinity}
              value={YAML.stringify(schema)}
              onChange={onChange}
              name="editor"
              editorProps={{ $blockScrolling: true }}
              style={{ flex: '1 1 0%', minHeight: '100%' }}
              showPrintMargin={false}
            />
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="simple-dialog-title"
        open={openDialog}
        fullWidth
      >
        <DialogTitle id="simple-dialog-title">Choose sheet</DialogTitle>
        <List>
          {sheets
            .filter((s) => s.sheet.grading.max === sumParam(schema, 'max'))
            .map((sheet) => (
              <ListItem
                button
                onClick={() => handleListItemClick(sheet)}
                key={
                  sheet.term + sheet.school + sheet.course + sheet.sheet.name
                }
              >
                <ListItemText
                  primary={sheet.sheet.name}
                  secondary={`${sheet.course} ${sheet.term}`}
                />
              </ListItem>
            ))}
        </List>
      </Dialog>
    </Grid>
  );
}
