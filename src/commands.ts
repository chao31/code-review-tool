import * as vs from 'vscode';
import { GitService, GitRepo, GitRefType, GitCommittedFile } from './gitService';
import * as path from 'path';

import { Model, HistoryViewContext } from './model';

interface RepoPickItem extends vs.QuickPickItem {
  repo: GitRepo;
}

class EnterShaPickItem implements vs.QuickPickItem {
  label = 'Enter commit SHA';
  description = '';
  openShaTextBox = true;
}

async function selectBranch(
  gitService: GitService,
  repo: GitRepo,
  allowEnterSha?: boolean
): Promise<vs.QuickPickItem[]> {
  const refs = await gitService.getRefs(repo);
  const items = refs.map(ref => {
    let description: string | undefined;
    if (ref.type === GitRefType.Head) {
      description = ref.commit;
    } else if (ref.type === GitRefType.Tag) {
      description = `Tag at ${ref.commit}`;
    } else if (ref.type === GitRefType.RemoteHead) {
      description = `Remote branch at ${ref.commit}`;
    }
    return { label: ref.name || ref.commit, description };
  });
  if (allowEnterSha) { 
    items.unshift(new EnterShaPickItem());
  }
  return items;
}

async function selectGitRepo(gitService: GitService): Promise<GitRepo | undefined> {
  const repos: GitRepo[] = gitService.getGitRepos();
  if (repos.length === 0) {
    return;
  }
  if (repos.length === 1) {
    return repos[0];
  }
  const pickItems: RepoPickItem[] = repos.map(repo => {
    return { label: path.basename(repo.root), description: repo.root, repo };
  });
  const item = await vs.window.showQuickPick(pickItems, {
    placeHolder: 'Select the git repo'
  });
  return item?.repo;
}

interface Command {
  id: string;
  method: Function;
}

const Commands: Command[] = [];

function command(id: string) {
    return function (_target: any, _key: string, descriptor: PropertyDescriptor) {
        console.log(3333);
        if (!(typeof descriptor.value === 'function')) {
            throw new Error('not supported');
        }
        Commands.push({ id, method: descriptor.value });
    };
}

export class CommandCenter {
  constructor(
    context: vs.ExtensionContext,
    private _model: Model,
    private _gitService: GitService,
  ) {
    context.subscriptions.push(
      ...Commands.map(({ id, method }) => {
        return vs.commands.registerCommand(id, (...args: any[]) => {
          Promise.resolve(method.apply(this, args));
        });
      })
    );
  }

  @command('code-review-tool.viewHistory')
  async viewHistory(): Promise<void> {
    vs.window.showInformationMessage('Hello World from codeReviewTool!');
  }

  @command('code-review-tool.viewBranchHistory')
  async viewBranchHistory(context?: HistoryViewContext): Promise<void> {
    let placeHolder: string = '选择一个分支做CR的对比';

    // let repo: GitRepo;
    // repo = {
    //   remoteUrl: 'https://git.woa.com/dwt/dwt',
    //   root: '/Users/tangchao/code/tencent/tencent3/dwt/dwt/'
    // };

    const repo = await selectGitRepo(this._gitService);
    if (repo) {
      await this._viewHistory({ repo, branch: '' });
    }

    console.log('444repo: ', repo);

    
    repo && vs.window.showQuickPick(selectBranch(this._gitService, repo), { placeHolder }).then(item => {
      console.log('item: ', item);
      // if (item) {
      //   if (context) {
      //     context.branch = item.label;
      //     this._viewHistory(context);
      //   } else {
      //     this._viewHistory({ branch: item.label, repo });
      //   }
      // }
    });
  }

  private async _viewHistory(context: HistoryViewContext, all: boolean = false): Promise<void> {
    await this._model.setHistoryViewContext(context);
  }
}
