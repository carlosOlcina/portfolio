import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  new URL('../.github/workflows/ci.yml', import.meta.url),
  'utf8',
);
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { engines?: { node?: string } };

const CHECK_COMMANDS = [
  'pnpm check',
  'pnpm lint',
  'pnpm format:check',
  'pnpm test',
] as const;

const compact = (value: string): string => value.replace(/\s+/g, ' ').trim();
const scalar = (value: string): string =>
  value.trim().replace(/^['"]|['"]$/g, '');

function stepBlock(marker: string): string {
  const start = workflow.indexOf(marker);
  if (start === -1) {
    throw new Error(`Step not found: ${marker}`);
  }
  const rest = workflow.slice(start + marker.length);
  const nextStep = rest.search(/^ {6}- /m);
  return nextStep === -1
    ? workflow.slice(start)
    : workflow.slice(start, start + marker.length + nextStep);
}

describe('ci workflow', () => {
  it('declares_workflow_file', () => {
    expect(workflow.trim()).not.toBe('');
  });

  it('names_workflow_ci', () => {
    expect(workflow.split('\n')[0]).toMatch(/^name: CI$/);
  });

  it('defines_single_job', () => {
    const jobs = workflow.slice(workflow.indexOf('jobs:') + 'jobs:'.length);
    const jobKeys = jobs.match(/^ {2}[a-z][\w-]*:/gm) ?? [];

    expect(jobKeys).toHaveLength(1);
    expect(jobKeys[0]).toBe('  ci:');
  });

  it('runs_on_ubuntu_latest', () => {
    expect(workflow).toMatch(/^ {4}runs-on: ubuntu-latest$/m);
  });

  it('grants_read_only_contents_permission', () => {
    expect(compact(workflow)).toContain('permissions: contents: read');
    expect(workflow).not.toContain('write');
  });

  it('triggers_on_pushes_to_all_branches', () => {
    expect(workflow).toMatch(/^ {2}push:\s*$/m);
    expect(workflow.match(/branches:/g)).toHaveLength(1);
    expect(compact(workflow)).toMatch(/on: push: pull_request:/);
  });

  it('triggers_on_pull_requests_targeting_main', () => {
    expect(compact(workflow)).toMatch(
      /pull_request: branches: (- main|\[main\])/,
    );
  });

  it('declares_no_other_triggers', () => {
    const onBlock = workflow.slice(
      workflow.indexOf('\non:') + '\non:'.length,
      workflow.indexOf('permissions:'),
    );
    const triggerKeys = onBlock.match(/^ {2}[a-z][\w-]*:/gm) ?? [];

    expect(triggerKeys.map((line) => line.trim())).toEqual([
      'push:',
      'pull_request:',
    ]);
  });

  it('checks_out_before_pnpm_setup', () => {
    const checkout = workflow.indexOf('actions/checkout@v6');
    const pnpmSetup = workflow.indexOf('pnpm/action-setup@v6');

    expect(checkout).toBeGreaterThanOrEqual(0);
    expect(pnpmSetup).toBeGreaterThanOrEqual(0);
    expect(checkout).toBeLessThan(pnpmSetup);
  });

  it('installs_pnpm_before_node_setup', () => {
    const pnpmSetup = workflow.indexOf('pnpm/action-setup@v6');
    const nodeSetup = workflow.indexOf('actions/setup-node@v7');

    expect(pnpmSetup).toBeGreaterThanOrEqual(0);
    expect(nodeSetup).toBeGreaterThanOrEqual(0);
    expect(pnpmSetup).toBeLessThan(nodeSetup);
  });

  it('enables_pnpm_dependency_caching', () => {
    expect(stepBlock('actions/setup-node@v7')).toMatch(/cache:\s*pnpm/);
  });

  it('pins_node_to_engines_minimum', () => {
    const nodeVersion = /node-version:\s*(\S+)/.exec(
      stepBlock('actions/setup-node@v7'),
    );
    const enginesFloor = /(\d+\.\d+\.\d+)/.exec(
      packageJson.engines?.node ?? '',
    );

    expect(nodeVersion).not.toBeNull();
    expect(enginesFloor).not.toBeNull();

    const pinnedNodeVersion = scalar(nodeVersion?.[1] ?? '');
    expect(pinnedNodeVersion).toBe(enginesFloor?.[1]);
    expect(pinnedNodeVersion).toBe('22.12.0');
  });

  it('installs_dependencies_from_frozen_lockfile', () => {
    expect(workflow).toContain('run: pnpm install --frozen-lockfile');
  });

  it('runs_checks_after_install', () => {
    const install = workflow.indexOf('pnpm install --frozen-lockfile');

    expect(install).toBeGreaterThanOrEqual(0);
    for (const command of CHECK_COMMANDS) {
      expect(workflow.indexOf(`run: ${command}`), command).toBeGreaterThan(
        install,
      );
    }
  });

  it('runs_typecheck', () => {
    expect(workflow).toContain('run: pnpm check');
  });

  it('runs_lint', () => {
    expect(workflow).toContain('run: pnpm lint');
  });

  it('checks_formatting', () => {
    expect(workflow).toContain('run: pnpm format:check');
  });

  it('runs_tests', () => {
    expect(workflow).toContain('run: pnpm test');
  });

  it('fails_job_on_check_failure', () => {
    expect(workflow).not.toContain('continue-on-error');
  });

  it('avoids_mutating_formatters', () => {
    expect(workflow).not.toMatch(/prettier\s+--write/);
    expect(workflow).not.toMatch(/^ *run: pnpm format$/m);
  });

  it('pins_action_versions', () => {
    expect(workflow).toContain('uses: actions/checkout@v6');
    expect(workflow).toContain('uses: pnpm/action-setup@v6');
    expect(workflow).toContain('uses: actions/setup-node@v7');
  });

  it('pins_pnpm_version', () => {
    expect(stepBlock('pnpm/action-setup@v6')).toMatch(/version:\s*12\.6\.0/);
  });

  it('excludes_build_deploy_release_and_publish', () => {
    expect(workflow).not.toMatch(
      /pnpm build|astro build|upload-artifact|deploy|release|publish/i,
    );
  });
});
