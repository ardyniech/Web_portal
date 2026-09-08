import json

def suggest_config_improvement(log_file):
    with open(log_file, 'r') as f:
        data = json.load(f)
    
    # Logika analisis otonom untuk mendeteksi bottleneck
    if data.get('error_rate', 0) > 0.05:
        return {"max_pool_size": "dynamic_increase", "timeout": "30s"}
    return None

if __name__ == '__main__':
    suggestion = suggest_config_improvement('system.log')
    if suggestion:
        with open('config/optimized.json', 'w') as f:
            json.dump(suggestion, f, indent=2)