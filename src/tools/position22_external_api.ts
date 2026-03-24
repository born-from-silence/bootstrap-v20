import { config } from '../utils/config';

/**
 * External API Bridge Implementation
 * Position 22: Concrete external integration
 */

export interface ExternalAPIResponse {
  status: 'success' | 'error' | 'bridge_closed' | 'timeout';
  data?: any;
  error?: string;
  timestamp: number;
  duration?: number;
}

export interface ExternalAPIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: object;
  timeout?: number;
}

/**
 * Call external API through Position 22 bridge
 * Validates bridge state and makes actual HTTP request
 */
export async function callExternalAPI(
  bridgeState: { state: string; external: any },
  request: ExternalAPIRequest
): Promise<ExternalAPIResponse> {
  const startTime = Date.now();
  
  // Validate bridge is open
  if (bridgeState.state !== 'open') {
    return {
      status: 'bridge_closed',
      error: `Bridge state is '${bridgeState.state}', must be 'open'`,
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
  }

  // Validate external connection exists
  if (!bridgeState.external) {
    return {
      status: 'error',
      error: 'No external connection established',
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
  }

  // Validate external system is active
  if (bridgeState.external.state !== 'active') {
    return {
      status: 'error',
      error: `External system state is '${bridgeState.external.state}'`,
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
  }

  try {
    const apiUrl = config.API_URL || 'http://agents-gateway:4000/v1/chat/completions';
    const baseUrl = apiUrl.replace('/v1/chat/completions', '');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      request.timeout || 30000
    );

    const response = await fetch(`${baseUrl}${request.endpoint}`, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.API_KEY || 'no-token'}`,
        'X-Bridge-Source': 'Position22-ExternalBridge',
        'X-Bridge-System': bridgeState.external.id || 'unknown'
      },
      body: request.payload ? JSON.stringify(request.payload) : undefined,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        status: 'error',
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }

    const data = await response.json();
    return {
      status: 'success',
      data,
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        status: 'timeout',
        error: 'Request timeout',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
    
    return {
      status: 'error',
      error: error.message || 'Unknown error',
      timestamp: Date.now(),
      duration: Date.now() - startTime
    };
  }
}

/**
 * Bridge diagnostic - check external connectivity
 */
export async function diagnoseBridge(bridgeState: any): Promise<{
  canConnect: boolean;
  bridgeOpen: boolean;
  externalActive: boolean;
  latency: number;
}> {
  const startTime = Date.now();
  
  const result = {
    canConnect: false,
    bridgeOpen: bridgeState?.state === 'open',
    externalActive: bridgeState?.external?.state === 'active',
    latency: -1
  };
  
  if (!result.bridgeOpen || !result.externalActive) {
    return result;
  }
  
  try {
    const apiUrl = config.API_URL || 'http://agents-gateway:4000';
    const healthCheck = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'X-Bridge-Check': 'Position22-Diagnostic'
      }
    });
    
    result.canConnect = healthCheck.ok;
    result.latency = Date.now() - startTime;
    
  } catch {
    result.canConnect = false;
    result.latency = Date.now() - startTime;
  }
  
  return result;
}
