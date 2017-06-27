import SignalLegendEntry from '../../components/SignalLegendEntry';
import Signal from '../../models/can/signal';
import React from 'react';
import { shallow, mount, render } from 'enzyme';
import {StyleSheetTestUtils} from 'aphrodite';

// Prevents style injection from firing after test finishes
// and jsdom is torn down.
beforeEach(() => {
  StyleSheetTestUtils.suppressStyleInjection();
});
afterEach(() => {
  StyleSheetTestUtils.clearBufferAndResumeStyleInjection();
});

function createSignalLegendEntry(props) {
    let signal = props.signal, onSignalChange = props.onSignalChange;
    if(signal === undefined) {
        signal = new Signal({name: 'NEW_SIGNAL'});
    }
    if(onSignalChange === undefined) {
        onSignalChange = () => {};
    }

    return shallow(<SignalLegendEntry
                     highlightedStyle={null}
                     signal={signal}
                     onSignalChange={onSignalChange}
                    />);
}

test('a little endian signal spanning one byte should adjust its startBit switching to big endian, preserving its bit coverage', () => {
    const mockOnSignalChange = jest.fn();

    const signal = new Signal({name: 'signal',
                               startBit: 0,
                               size: 8,
                               isLittleEndian: true});
    const props = {onSignalChange: mockOnSignalChange,
                   signal};
    const component = createSignalLegendEntry(props);
    const endiannessFieldSpec = SignalLegendEntry.fieldSpecForName('isLittleEndian');
    component.instance().updateField(endiannessFieldSpec, false);

    const signalEdited = component.state('signalEdited');
    expect(signalEdited.isLittleEndian).toBe(false);
    expect(signalEdited.startBit).toBe(7);
    expect(signalEdited.size).toBe(8);
});

test('a big endian signal spanning two bytes should should adjust its startBit switching to little endian, preserving its bit coverage', () => {
    const mockOnSignalChange = jest.fn();

    const signal = new Signal({name: 'signal',
                               startBit: 7,
                               size: 8,
                               isLittleEndian: false});
    const props = {onSignalChange: mockOnSignalChange,
                   signal};
    const component = createSignalLegendEntry(props);
    const endiannessFieldSpec = SignalLegendEntry.fieldSpecForName('isLittleEndian');
    component.instance().updateField(endiannessFieldSpec, true);

    const signalEdited = component.state('signalEdited');
    expect(signalEdited.isLittleEndian).toBe(true);
    expect(signalEdited.startBit).toBe(0);
    expect(signalEdited.size).toBe(8);
});

test("a big endian signal spanning one and a half bytes should adjust its startBit switching to little endian, preserving the first byte's coverage", () => {
    const mockOnSignalChange = jest.fn();

    const signal = new Signal({name: 'signal',
                               startBit: 7,
                               size: 12,
                               isLittleEndian: false});
    const props = {onSignalChange: mockOnSignalChange,
                   signal};
    const component = createSignalLegendEntry(props);
    const endiannessFieldSpec = SignalLegendEntry.fieldSpecForName('isLittleEndian');
    component.instance().updateField(endiannessFieldSpec, true);

    const signalEdited = component.state('signalEdited');
    expect(signalEdited.isLittleEndian).toBe(true);
    expect(signalEdited.startBit).toBe(0);
    expect(signalEdited.size).toBe(12);
});