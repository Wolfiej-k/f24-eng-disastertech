import docker
import requests
from datetime import datetime, timezone

containers = ["frontend", "backend", "llama", "database"]
client = docker.from_env()

def get_stats(name: str):
  """Get essential stats for a Docker container."""
  container = client.containers.get(name)
  stats = container.stats(stream=False)

  try:
    cpu_percent = 0.0
    if 'cpu_stats' in stats and 'precpu_stats' in stats:
      cpu_delta = float(stats['cpu_stats']['cpu_usage']['total_usage'] -
                      stats['precpu_stats']['cpu_usage']['total_usage'])
      system_delta = float(stats['cpu_stats']['system_cpu_usage'] -
                          stats['precpu_stats']['system_cpu_usage'])
      if system_delta > 0:
        cpu_percent = (cpu_delta / system_delta) * 100.0
  except:
    cpu_percent = 0.0

  try:
    mem_usage = stats['memory_stats']['usage']
    mem_limit = stats['memory_stats']['limit']
    mem_percent = (mem_usage / mem_limit) * 100.0
  except:
    mem_usage = 0
    mem_limit = 0
    mem_percent = 0.0

  return {
    "status": container.status,
    "cpu": {
      "percent": round(cpu_percent, 2)
    },
    "memory": {
      "usage_mb": round(mem_usage / (1024 * 1024), 2),
      "limit_mb": round(mem_limit / (1024 * 1024), 2),
      "percent": round(mem_percent, 2)
    }
  }

def container_stats():
  """Get stats for four primary containers."""
  stats = {container: get_stats(container) for container in containers}

  try:
    llama_response = requests.get('http://llama:8080/metrics', timeout=2)
    if llama_response.status_code == 200:
      container_stats["llama"]["metrics"] = llama_response.json()
  except:
    pass

  return {
    "timestamp": datetime.now(timezone.utc),
    "containers": stats
  }

def container_health():
  """Ensure primary containers are running and healthy."""
  health = {
    "status": "healthy",
    "containers": {}
  }

  for container in containers:
    try:
      status = client.containers.get(container).status
      health["containers"][container] = status
      if status != "running":
        health["status"] = "degraded"
    except:
      health["containers"][container] = "not_found"
      health["status"] = "degraded"

  return health
