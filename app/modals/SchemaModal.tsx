/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import AceEditor from 'react-ace';
import * as YAML from 'yaml';
import React, { FC, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import { useDispatch, useSelector } from 'react-redux';
import CodeIcon from '@material-ui/icons/Code';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {
  Button,
  DialogActions,
  Grid,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { denormalize } from 'normalizr';
import { clipboard } from 'electron';
import { ModalProps, useModal } from './ModalProvider';
import DialogTitleWithCloseIcon from './DialogTitleWithCloseIcon';
import SchemaGeneratorToolbar from '../features/schema-generator/SchemaGeneratorToolbar';
import {
  schemaSetEntities,
  selectSchemaClipboard,
  selectSchemaComments,
  selectSchemaEntities,
  selectSchemaRatings,
  selectSchemaSelectedSheetId,
  selectSchemaTasks,
} from '../model/SchemaSlice';
import { selectAllSheets, selectSheetById } from '../model/SheetSlice';
import SchemaTaskList from '../features/schema-generator/SchemaTaskList';
import { getTopLevelTasks, hasTasksWithZeroMax } from '../utils/TaskUtil';
import { TasksSchema, RatingsSchema } from '../model/NormalizationSchema';
import RatingEntity from '../model/RatingEntity';
import SheetEntity from '../model/SheetEntity';
import TaskEntity from '../model/TaskEntity';
import Rating from '../model/Rating';
import Task from '../model/Task';
import CheckClipboardEffect from '../effects/CheckClipboardEffect';
import { shouldUseDarkColors } from '../model/Theme';
import { selectSettingsGeneral } from '../model/SettingsSlice';
import OverwriteSchemaDialog, {
  onInitializeSheet,
} from '../dialogs/OverwriteSchemaDialog';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import CommentEntity from '../model/CommentEntity';
import { getMaxValueForTasks } from '../utils/Formatter';
import { stringifySchemaTasks } from '../utils/SchemaUtil';

type SchemaModalProps = ModalProps;

const SchemaModal: FC<SchemaModalProps> = (props) => {
  const { close } = props;
  const dispatch = useDispatch();
  const showModal = useModal();
  const { theme } = useSelector(selectSettingsGeneral);
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const selectedSheet = useSelector((state: never) =>
    selectSheetById(state, selectedSheetId)
  );
  const { autosave } = useSelector(selectSettingsGeneral);
  const commentsEntity: CommentEntity[] = useSelector(selectSchemaComments);
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
  const maxValueTasks: number = tasks
    ? getMaxValueForTasks(getTopLevelTasks(tasks))
    : 0;

  const clipboardOld = useSelector(selectSchemaClipboard);
  const [skipCheck, setSkipCheck] = useState<boolean>(false);

  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);

  function onChange(newValue: string) {
    if (newValue !== null) {
      try {
        const newEntities = YAML.parse(newValue);
        if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
          dispatch(schemaSetEntities(newEntities));
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }
  }

  const getErrorMessage = () => {
    if (hasTasksWithZeroMax(tasksEntity)) {
      return `Some tasks have zero max ${selectedSheet?.valueType}`;
    }

    if (selectedSheet && selectedSheet?.maxValue - maxValueTasks !== 0) {
      return `${Math.abs(selectedSheet?.maxValue - maxValueTasks)} ${
        selectedSheet?.valueType
      } ${
        selectedSheet?.maxValue - maxValueTasks < 0 ? 'too much' : 'remaining'
      }`;
    }

    return '';
  };

  const onAssignSchema = () => {
    onInitializeSheet(
      dispatch,
      showModal,
      autosave,
      selectedSheet,
      tasks,
      tasksEntity,
      ratingsEntity,
      commentsEntity
    );
  };

  const onOverwriteSchema = () => {
    showModal(
      ConfirmationDialog,
      OverwriteSchemaDialog(
        showModal,
        autosave,
        selectedSheet,
        tasks,
        tasksEntity,
        ratingsEntity,
        commentsEntity
      )
    );
  };

  const onCopyToClipboard = () => {
    setSkipCheck(true);
    clipboard.writeText(
      JSON.stringify(
        stringifySchemaTasks(
          getTopLevelTasks(tasks),
          ratingsEntity,
          commentsEntity
        )
      )
    );
  };

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
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Typography variant="h5">
              {`Create task schema: ${selectedSheet?.name}`}
            </Typography>
          </Grid>
          <Grid item container>
            <SchemaGeneratorToolbar />
          </Grid>
        </Grid>
      </DialogTitleWithCloseIcon>
      <DialogContent
        dividers
        style={{ padding: '0px', overflowX: 'hidden', height: '100%' }}
      >
        {!showCodeEditor ? (
          <SchemaTaskList
            type={selectedSheet?.valueType || 'ERROR'}
            tasks={getTopLevelTasks(tasks)}
            ratings={ratings}
            depth={0}
          />
        ) : (
          <AceEditor
            mode="yaml"
            theme={shouldUseDarkColors(theme) ? 'twilight' : 'textmate'}
            width="100%"
            height="100%"
            maxLines={Infinity}
            value={entities ? YAML.stringify(entities) : ''}
            onChange={onChange}
            name="editor"
            editorProps={{ $blockScrolling: true }}
            style={{ flex: '1 1 0%', minHeight: '100%' }}
            showPrintMargin={false}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Tooltip title="Toggle Code Editor">
          <span>
            <ToggleButton
              value="check"
              size="small"
              selected={showCodeEditor}
              onChange={() => {
                setShowCodeEditor(!showCodeEditor);
              }}
            >
              <CodeIcon />
            </ToggleButton>
          </span>
        </Tooltip>
        <div style={{ flex: '1 0 0', textAlign: 'center' }}>
          <Typography color="error">{getErrorMessage()}</Typography>
        </div>
        <Tooltip title="Copy to clipboard">
          <span>
            <IconButton
              onClick={onCopyToClipboard}
              disabled={hasTasksWithZeroMax(tasksEntity) || maxValueTasks <= 0}
              size="small"
            >
              <AssignmentIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="contained"
          color="primary"
          onClick={
            selectedSheet &&
            selectedSheet.tasks &&
            selectedSheet.tasks.length > 0
              ? onOverwriteSchema
              : onAssignSchema
          }
          disabled={
            maxValueTasks !== selectedSheet?.maxValue ||
            hasTasksWithZeroMax(tasksEntity) ||
            maxValueTasks <= 0
          }
        >
          {selectedSheet &&
          selectedSheet.tasks &&
          selectedSheet.tasks.length > 0
            ? 'Overwrite'
            : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchemaModal;
