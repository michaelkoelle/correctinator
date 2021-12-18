/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import { useDispatch, useSelector } from 'react-redux';
import { DialogActions, Grid } from '@material-ui/core';
import { denormalize } from 'normalizr';
import { clipboard } from 'electron';
import { ModalProps, useModal } from './ModalProvider';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';
import SchemaGeneratorToolbar from '../features/schema-generator/SchemaGeneratorToolbar';
import {
  schemaAddTask,
  selectSchemaClipboard,
  selectSchemaEntities,
  selectSchemaRatings,
  selectSchemaSelectedSheetId,
  selectSchemaTasks,
} from '../model/SchemaSlice';
import { selectAllSheets, selectSheetById } from '../model/SheetSlice';
import SchemaTaskList from '../features/schema-generator/SchemaTaskList';
import { getTopLevelTasks } from '../utils/TaskUtil';
import { TasksSchema, RatingsSchema } from '../model/NormalizationSchema';
import RatingEntity from '../model/RatingEntity';
import SheetEntity from '../model/SheetEntity';
import TaskEntity from '../model/TaskEntity';
import Rating from '../model/Rating';
import Task from '../model/Task';

import CheckClipboardEffect from '../effects/CheckClipboardEffect';
import SplitButton from '../components/SplitButton';
import TaskType from '../model/TaskType';

type SchemaModalProps = ModalProps;

const SchemaModal: FC<SchemaModalProps> = (props) => {
  const { close } = props;
  const dispatch = useDispatch();
  const showModal = useModal();
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const selectedSheet = useSelector((state: never) =>
    selectSheetById(state, selectedSheetId)
  );
  const tasksEntity: TaskEntity[] = useSelector(selectSchemaTasks);
  const ratingsEntity: RatingEntity[] = useSelector(selectSchemaRatings);
  const entities = useSelector(selectSchemaEntities);
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

  const clipboardOld = useSelector(selectSchemaClipboard);
  const [skipCheck, setSkipCheck] = useState<boolean>(false);

  useEffect(
    CheckClipboardEffect(
      dispatch,
      showModal,
      clipboard,
      sheets,
      clipboardOld,
      skipCheck,
      setSkipCheck,
      entities
    ),
    [clipboardOld, skipCheck, entities]
  );

  return (
    <Dialog
      {...props}
      fullWidth
      disableBackdropClick
      maxWidth={false}
      style={{ paddingTop: '16px', height: '100%' }}
      PaperProps={{
        style: {
          height: '100%',
        },
      }}
    >
      <DialogTitleWithCloseIcon onClose={close}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h5">
              {`Create task schema: ${selectedSheet?.name}`}
            </Typography>
          </Grid>
          <Grid item container>
            <SchemaGeneratorToolbar setSkipCheck={setSkipCheck} />
          </Grid>
        </Grid>
      </DialogTitleWithCloseIcon>
      <DialogContent
        dividers
        style={{ padding: '0px', overflowX: 'hidden', height: '100%' }}
      >
        <SchemaTaskList
          type={selectedSheet?.valueType || 'ERROR'}
          tasks={getTopLevelTasks(tasks)}
          ratings={ratings}
          depth={0}
        />
      </DialogContent>
      <DialogActions>
        <SplitButton
          style={{ margin: '5px 0 5px 0' }}
          options={[
            {
              name: 'Add Simple Task',
              onClick: () => dispatch(schemaAddTask(TaskType.Simple)),
            },
            {
              name: 'Add Single Choice Task',
              onClick: () => dispatch(schemaAddTask(TaskType.SingleChoice)),
            },
          ]}
        />
      </DialogActions>
    </Dialog>
  );
};

export default SchemaModal;
