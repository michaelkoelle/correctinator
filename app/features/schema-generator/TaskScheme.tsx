/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  Button,
  ButtonGroup,
  Card,
  CardActions,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from '@material-ui/core';
import styles from './TaskScheme.css';
import { sumParam } from '../../utils/FileAccess';

export default function TaskScheme(props: any) {
  const { task, setTask, selected, setSelected, depth } = props;
  const [expanded, setExpanded] = React.useState(false);
  const INDENT_SIZE = 25;

  function handleChange(e: any) {
    const temp = { ...task };
    const { name, value } = e.target;
    temp[name] = value;

    // Make sure that value <= max
    if (name === 'max' || name === 'value') {
      temp.value = Math.min(temp.value, temp.max);
    }

    setTask(temp);
  }

  function onSelection() {
    setSelected(task);
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const marginLeft = `${depth * INDENT_SIZE}pt`;

  if (task.tasks.length > 0) {
    const sumMax = sumParam(task.tasks, 'max');
    const sumValue = sumParam(task.tasks, 'value');

    return (
      <Card
        style={{ marginLeft }}
        raised={selected}
        // variant={selected ? 'elevation' : undefined}
        className={styles.card}
        onClick={onSelection}
        onKeyDown={onSelection}
        // variant="outlined"
        // className={[styles.card, selected ? styles.selected : ''].join(' ')}
      >
        <TextField
          id="outlined-number"
          label="Task name"
          multiline
          name="name"
          value={task.name}
          onChange={handleChange}
          className={styles.fields}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Inital"
          id="value"
          name="value"
          style={{ width: `${task.type.length * 0.6 + 5}em` }}
          type="number"
          value={sumValue}
          className={styles.fields}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{task.type}</InputAdornment>
            ),
          }}
          inputProps={{
            min: 0,
            max: task.max,
            step: task.step,
          }}
          onChange={handleChange}
          size="small"
          variant="outlined"
          disabled
        />
        <TextField
          label="Max"
          id="max"
          name="max"
          style={{ width: `${task.type.length * 0.6 + 5}em` }}
          type="number"
          className={styles.fields}
          value={sumMax}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{task.type}</InputAdornment>
            ),
          }}
          inputProps={{ min: 0, step: task.step }}
          onChange={handleChange}
          size="small"
          variant="outlined"
          disabled
        />
      </Card>
    );
  }

  return (
    <Card
      raised={selected}
      variant="outlined"
      // variant={selected ? 'elevation' : undefined}
      style={{ marginLeft }}
      onClick={onSelection}
      onKeyDown={onSelection}
      // className={styles.card}
      className={[styles.card, selected ? styles.selected : ''].join(' ')}
    >
      <TextField
        id="outlined-number"
        label="Task name"
        multiline
        name="name"
        value={task.name}
        onChange={handleChange}
        className={styles.fields}
        variant="outlined"
        size="small"
      />
      <TextField
        label="Inital"
        id="value"
        name="value"
        style={{ width: `${task.type.length * 0.6 + 5}em` }}
        type="number"
        value={task.value}
        className={styles.fields}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">{task.type}</InputAdornment>
          ),
        }}
        inputProps={{ min: 0, max: task.max, step: task.step }}
        onChange={handleChange}
        size="small"
        variant="outlined"
      />
      <TextField
        label="Max"
        id="max"
        name="max"
        style={{ width: `${task.type.length * 0.6 + 5}em` }}
        type="number"
        value={task.max}
        className={styles.fields}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">{task.type}</InputAdornment>
          ),
        }}
        inputProps={{ min: 0, step: task.step }}
        onChange={handleChange}
        size="small"
        variant="outlined"
      />
      <IconButton
        onClick={handleExpandClick}
        aria-expanded={expanded}
        aria-label="show more"
        className={styles.expand}
        size="medium"
      >
        <ExpandMoreIcon className={styles.expandIcon} />
      </IconButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <TextField
          id="outlined-number"
          label="Step"
          type="number"
          name="step"
          style={{ width: '5em' }}
          className={styles.fields}
          value={task.step}
          inputProps={{ min: '0.5', step: '0.5' }}
          onChange={handleChange}
          variant="outlined"
          size="small"
        />
        <TextField
          id="tasktype"
          label="Type"
          type="text"
          name="type"
          className={styles.fields}
          // style={{ width: '5em' }}
          value={task.type}
          onChange={handleChange}
          variant="outlined"
          size="small"
        />
        <TextField
          id="comment"
          label="Comment"
          multiline
          className={styles.comment}
          name="comment"
          value={task.comment}
          onChange={handleChange}
          variant="outlined"
          size="small"
        />
      </Collapse>
    </Card>
  );
}
