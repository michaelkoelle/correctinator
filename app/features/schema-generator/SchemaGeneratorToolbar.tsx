/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import { Grid, TextField } from '@material-ui/core';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import { useDispatch, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import {
  schemaAddTask,
  selectSchemaEntities,
  selectSchemaRatings,
  selectSchemaSelectedSheetId,
  selectSchemaTasks,
} from '../../model/SchemaSlice';
import RatingEntity from '../../model/RatingEntity';
import SheetEntity from '../../model/SheetEntity';
import {
  getMaxValueForTasks,
  getTotalValueOfRatings,
} from '../../utils/Formatter';
import TaskEntity from '../../model/TaskEntity';
import { getTopLevelTasks, hasTasksWithZeroMax } from '../../utils/TaskUtil';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import { TasksSchema, RatingsSchema } from '../../model/NormalizationSchema';
import { selectAllSheets } from '../../model/SheetSlice';
import SplitButton from '../../components/SplitButton';
import TaskType from '../../model/TaskType';

export default function SchemaGeneratorToolbar() {
  const dispatch = useDispatch();
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const tasksEntity: TaskEntity[] = useSelector(selectSchemaTasks);
  const ratingsEntity: RatingEntity[] = useSelector(selectSchemaRatings);
  const entities = useSelector(selectSchemaEntities);
  const selectedSheet: SheetEntity | undefined = sheets.find(
    (s) => s.id === selectedSheetId
  );
  const tasks: Task[] = denormalize(
    tasksEntity.map((t) => t.id),
    TasksSchema,
    entities
  );
  const ratings: Rating[] = denormalize(
    ratingsEntity.map((t) => t.id),
    RatingsSchema,
    entities
  );
  const maxValueTasks: number = tasks
    ? getMaxValueForTasks(getTopLevelTasks(tasks))
    : 0;
  const maxValue: number = selectedSheet?.maxValue || maxValueTasks;

  if (!selectedSheet) {
    return null;
  }

  return (
    <Grid
      item
      container
      justify="space-between"
      alignItems="center"
      direction="row"
      wrap="nowrap"
      spacing={2}
    >
      <Grid
        item
        container
        alignItems="center"
        direction="row"
        spacing={2}
        style={{ width: 'fit-content' }}
      >
        <Grid item>
          <TextField
            variant="outlined"
            type="number"
            label="Value"
            size="small"
            style={{ width: '6em' }}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              min: 0,
              step: 0.5,
            }}
            value={getTotalValueOfRatings(ratings)}
            error={getTotalValueOfRatings(ratings) > selectedSheet.maxValue}
          />
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            type="number"
            label="Max"
            size="small"
            style={{ width: '6em' }}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{
              min: 0,
              step: 0.5,
            }}
            value={maxValue}
            error={
              maxValueTasks !== selectedSheet.maxValue ||
              hasTasksWithZeroMax(tasksEntity) ||
              maxValue <= 0
            }
          />
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            label="Type"
            size="small"
            value={selectedSheet?.valueType}
            InputProps={{
              readOnly: true,
            }}
            style={{ width: '110px' }}
          />
        </Grid>
      </Grid>
      <Grid
        item
        container
        alignItems="center"
        direction="row"
        spacing={2}
        style={{ width: 'fit-content' }}
      >
        <SplitButton
          style={{ margin: '5px 0 5px 0' }}
          options={[
            {
              name: 'Add Task',
              onClick: () => dispatch(schemaAddTask(TaskType.Simple)),
            },
            {
              name: 'Add Single Choice',
              onClick: () => dispatch(schemaAddTask(TaskType.SingleChoice)),
            },
          ]}
        />
      </Grid>
    </Grid>
  );
}
