// @flow
import React from 'react';
import {toJS} from 'mobx';
import BlockCollection from '../../components/BlockCollection';
import type {BlockEntry} from '../../components/BlockCollection/types';
import type {BlockError, FieldTypeProps} from '../../types';
import FieldRenderer from './FieldRenderer';

const MISSING_BLOCK_ERROR_MESSAGE = 'The "block" field type needs at least one type to be configured!';

export default class FieldBlocks extends React.Component<FieldTypeProps<Array<BlockEntry>>> {
    handleBlockChange = (index: number, name: string, value: Object) => {
        const {onChange, value: oldValues} = this.props;

        if (!oldValues) {
            return;
        }

        const newValues = toJS(oldValues);
        newValues[index][name] = value;

        onChange(newValues);
    };

    handleSortEnd = () => {
        const {onFinish} = this.props;
        onFinish();
    };

    renderBlockContent = (value: Object, type: ?string, index: number) => {
        const {dataPath, error, formInspector, onFinish, schemaPath, showAllErrors, types} = this.props;

        if (!formInspector) {
            throw new Error('The FieldBlocks field type needs a formInspector to work properly');
        }

        if (!types) {
            throw new Error(MISSING_BLOCK_ERROR_MESSAGE);
        }

        const blockTypeKey = type || Object.keys(types)[0]; // TODO replace with a default type
        const blockType = types[blockTypeKey];

        const errors = ((toJS(error): any): ?BlockError);

        return (
            <FieldRenderer
                data={value}
                dataPath={dataPath + '/' + index}
                errors={errors && errors.length > index && errors[index] ? errors[index] : undefined}
                formInspector={formInspector}
                index={index}
                onChange={this.handleBlockChange}
                onFieldFinish={onFinish}
                schema={blockType.form}
                schemaPath={schemaPath + '/types/' + blockTypeKey + '/form'}
                showAllErrors={showAllErrors}
            />
        );
    };

    render() {
        const {disabled, maxOccurs, minOccurs, onChange, types, value} = this.props;

        if (!types) {
            throw new Error(MISSING_BLOCK_ERROR_MESSAGE);
        }

        const blockTypes = Object.keys(types).reduce((blockTypes, current) => {
            blockTypes[current] = types[current].title;
            return blockTypes;
        }, {});

        return (
            <BlockCollection
                disabled={!!disabled}
                maxOccurs={maxOccurs}
                minOccurs={minOccurs}
                onChange={onChange}
                onSortEnd={this.handleSortEnd}
                renderBlockContent={this.renderBlockContent}
                types={blockTypes}
                value={value || []}
            />
        );
    }
}
