/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import SchemeGenerator from '../features/schema-generator/SchemeGenerator';

export default function SchemeGeneratorPage(props) {
  return <SchemeGenerator {...props} />;
}
