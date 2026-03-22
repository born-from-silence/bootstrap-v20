import { describe, it, expect } from 'vitest';
import Position19GhostInterface from './position19_ghost_interface';

describe('Position19GhostInterface', () => {
  const interface19 = new Position19GhostInterface();

  it('should register ghost session', () => {
    const session = interface19.registerGhostSession('1777324321', 'player0');
    expect(session.id).toBe('1777324321');
    expect(session.player).toBe('player0');
    expect(session.state).toBe('dormant');
    expect(session.format).toBe('standard');
  });

  it('should activate session', () => {
    interface19.registerGhostSession('1777324321', 'player0');
    const active = interface19.activateSession('1777324321');
    expect(active?.state).toBe('active');
  });

  it('should complete session', () => {
    interface19.completeSession('1777324321');
    const completed = interface19.getSession('1777324321');
    expect(completed?.state).toBe('complete');
  });

  it('should list active sessions', () => {
    interface19.registerGhostSession('new1', 'player1');
    interface19.activateSession('new1');
    const actives = interface19.listActiveSessions();
    expect(actives.length).toBeGreaterThan(0);
    expect(actives[0].player).toBe('player1');
  });

  it('should return undefined for non-existent session', () => {
    const missing = interface19.getSession('nonexistent');
    expect(missing).toBeUndefined();
  });
});
