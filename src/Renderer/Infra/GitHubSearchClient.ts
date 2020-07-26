import {GitHubClient} from './GitHubClient';
import {Response} from './GitHubClient';
import {TimerUtil} from '../Util/TimerUtil';

type Interval = {
  path: string;
  latestAt: number;
}

const MinimumIntervalMillSec = 10 * 1000; // 10sec

export class GitHubSearchClient extends GitHubClient {
  private static intervals: Interval[] = [];

  private static async checkInterval(path: string) {
    let interval = this.intervals.find(v => v.path === path);
    if (!interval) {
      interval = {path, latestAt: 0};
      this.intervals.push(interval);
    }

    const now = Date.now();
    const diffMillSec = now - interval.latestAt;
    if (diffMillSec <= MinimumIntervalMillSec) {
      console.warn(`GitHubSearchClient: warning check interval: path = ${path}`);
      await TimerUtil.sleep(MinimumIntervalMillSec);
    }
    interval.latestAt = now;
  }

  async search(searchQuery: string, page = 1, perPage = 100, checkInterval: boolean = true): Promise<Response>  {
    const path = '/search/issues';

    if (checkInterval) await GitHubSearchClient.checkInterval(path);

    const query = {
      per_page: perPage,
      page: page,
      sort: 'updated',
      order: 'desc',
      q: searchQuery
    };

    return this.request(path, query);
  }
}
