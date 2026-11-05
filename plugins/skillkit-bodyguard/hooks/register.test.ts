import { test, expect } from 'claude-code/testing'
import { classify } from './register'

const asks = (c: string) => expect(classify(c)).not.toBeNull()
const free = (c: string) => expect(classify(c)).toBeNull()

test('rm: asks outside temp, free inside', () => {
  asks('rm -rf ~/projects/foo')
  asks('rm -f important.txt')
  asks('ls && rm -rf /home/x')
  asks('rm -rf /tmp/../etc')
  free('rm -rf /tmp/ft')
  free('rm -f "$TMPDIR/a.json"')
  free('rm -f $TMPDIR/a.json $TMPDIR/b.json')
  free('rm file.txt')
})

test('powershell Remove-Item', () => {
  asks('Remove-Item -Recurse -Force C:/work/foo')
  free('Remove-Item -Recurse -Force $env:TEMP/scratch -ErrorAction SilentlyContinue')
  free('Remove-Item foo.txt')
})

test('git', () => {
  asks('git push --force origin main')
  asks('git push -f')
  asks('git push origin +main')
  asks('git reset --hard HEAD~1')
  free('git push --force-with-lease origin feat/x')
  free('git push origin feat/x')
  free('git reset --soft HEAD~1')
})

test('details shown in the confirmation', () => {
  const rm = classify('rm -rf /tmp/scratch ~/work/foo')!
  expect(rm.details.join('\n')).toContain('✓ /tmp/scratch')
  expect(rm.details.join('\n')).toContain('✗ ~/work/foo')
  expect(classify('git reset --hard HEAD~2')!.details[0]).toBe('Target: HEAD~2')
  expect(classify('git push --force origin feat/x')!.details.join('\n')).toContain('Branch(es): feat/x')
  expect(classify('sqlcmd -Q "DROP TABLE dbo.Users;"')!.details[0]).toBe('Table: dbo.Users')
})

test('sql', () => {
  asks('sqlcmd -Q "drop table Users"')
  free('sqlcmd -Q "select 1"')
})
