import {shell} from 'electron';
import React from 'react';
import {StreamEvent} from '../../Event/StreamEvent';
import {SystemStreamEvent} from '../../Event/SystemStreamEvent';
import {StreamRepo} from '../../Repository/StreamRepo';
import {SystemStreamRepo} from '../../Repository/SystemStreamRepo';
import {DateUtil} from '../../Util/DateUtil';
import {VersionEvent} from '../../Event/VersionEvent';
import {VersionType} from '../../Repository/VersionRepo';

interface State {
  lastStream: any;
  lastDate: Date;
  newVersion: VersionType;
}

export class FooterFragment extends React.Component<any, State> {
  state: State = {lastStream: null, lastDate: null, newVersion: null};
  private readonly _streamListenerId: number[] = [];
  private readonly _systemStreamListenerId: number[] = [];

  componentDidMount() {
    {
      let id = SystemStreamEvent.addUpdateStreamListener(this._updateTime.bind(this, 'system'));
      this._systemStreamListenerId.push(id);
    }

    {
      let id = StreamEvent.addUpdateStreamListener(this._updateTime.bind(this, 'stream'));
      this._streamListenerId.push(id);
    }

    VersionEvent.onNewVersion(this, (newVersion) => this.setState({newVersion}));
  }

  componentWillUnmount(): void {
    SystemStreamEvent.removeListeners(this._systemStreamListenerId);
    StreamEvent.removeListeners(this._streamListenerId);
  }

  async _updateTime(type, streamId) {
    let stream;
    switch (type) {
      case 'system':
        stream = await SystemStreamRepo.findStream(streamId);
        break;
      case 'stream':
        stream = await StreamRepo.findStream(streamId);
        break;
      default:
        throw new Error(`unknown stream type: ${type}`);
    }

    this.setState({lastStream: stream, lastDate: new Date()})
  }

  _handleNewVersion() {
    shell.openExternal(this.state.newVersion.url);
  }

  render() {
    let lastStreamMessage;
    let hoverMessage;
    if (this.state.lastStream) {
      const lastDate = DateUtil.localToString(this.state.lastDate);
      lastStreamMessage = `Latest Connection: ${lastDate.split(' ')[1]}`;
      hoverMessage = `"${this.state.lastStream.name}" stream connection at ${lastDate}`;
    }

    let newVersion = '';
    if (this.state.newVersion) {
      newVersion = 'New Version'
    }

    return <footer className="toolbar toolbar-footer">
      <span className="flex-stretch"/>
      <span title={hoverMessage}>{lastStreamMessage}</span>
      <span className={`new-version-available ${newVersion? '': 'hidden'}`} onClick={this._handleNewVersion.bind(this)}>{newVersion}</span>
    </footer>
  }
}
