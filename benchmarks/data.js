window.BENCHMARK_DATA = {
  "lastUpdate": 1771562037513,
  "repoUrl": "https://github.com/albertobadia/zoocache",
  "entries": {
    "Python Benchmark": [
      {
        "commit": {
          "author": {
            "email": "alberto_badia@enlacepatagonia.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "committer": {
            "email": "alberto_badia@enlacepatagonia.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "distinct": true,
          "id": "18a484c39027965f40315cddb41a9a96a67bc8c9",
          "message": "FIX: Bench GH page not working on dev",
          "timestamp": "2026-02-20T01:31:21-03:00",
          "tree_id": "624ea96ee089d708a0e1220aa5bf370ddc349283",
          "url": "https://github.com/albertobadia/zoocache/commit/18a484c39027965f40315cddb41a9a96a67bc8c9"
        },
        "date": 1771562037026,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 434538.38518701366,
            "unit": "iter/sec",
            "range": "stddev: 4.531814746703362e-7",
            "extra": "mean: 2.3012926684707655 usec\nrounds: 11853"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.787590800654684,
            "unit": "iter/sec",
            "range": "stddev: 0.00011294510150491192",
            "extra": "mean: 102.17018879999671 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 85365.89530100899,
            "unit": "iter/sec",
            "range": "stddev: 0.000006216388534062108",
            "extra": "mean: 11.714279999921473 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.48806901857049,
            "unit": "iter/sec",
            "range": "stddev: 0.00008089197108140812",
            "extra": "mean: 6.006436412500271 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.66829870313458,
            "unit": "iter/sec",
            "range": "stddev: 0.00004427836172797737",
            "extra": "mean: 5.565812150602579 msec\nrounds: 166"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 180.05183555260757,
            "unit": "iter/sec",
            "range": "stddev: 0.00004629335526074245",
            "extra": "mean: 5.553956153409054 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1036.2877159198295,
            "unit": "iter/sec",
            "range": "stddev: 0.00007194458796008707",
            "extra": "mean: 964.9829720430297 usec\nrounds: 930"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.88814837367948,
            "unit": "iter/sec",
            "range": "stddev: 0.00010629122000848395",
            "extra": "mean: 6.8545663999969975 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6205.102514602684,
            "unit": "iter/sec",
            "range": "stddev: 0.00001884981787245233",
            "extra": "mean: 161.1576920198603 usec\nrounds: 4812"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5204.340368412982,
            "unit": "iter/sec",
            "range": "stddev: 0.000010910781750848721",
            "extra": "mean: 192.14730959361546 usec\nrounds: 4086"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 82.98879413974659,
            "unit": "iter/sec",
            "range": "stddev: 0.000524224409891084",
            "extra": "mean: 12.049819621623598 msec\nrounds: 37"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 84.46551458103382,
            "unit": "iter/sec",
            "range": "stddev: 0.0006855986775228594",
            "extra": "mean: 11.839151220000304 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 465211.314682898,
            "unit": "iter/sec",
            "range": "stddev: 4.3388268857032166e-7",
            "extra": "mean: 2.1495607876210623 usec\nrounds: 97561"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 455261.9629861801,
            "unit": "iter/sec",
            "range": "stddev: 4.363037888938769e-7",
            "extra": "mean: 2.1965375570599908 usec\nrounds: 171792"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 439956.0091544274,
            "unit": "iter/sec",
            "range": "stddev: 0.000001094814552791466",
            "extra": "mean: 2.272954520889368 usec\nrounds: 164691"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 446082.8856510556,
            "unit": "iter/sec",
            "range": "stddev: 7.856826826395867e-7",
            "extra": "mean: 2.2417358570941484 usec\nrounds: 145709"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 454546.80764608807,
            "unit": "iter/sec",
            "range": "stddev: 4.375377017145012e-7",
            "extra": "mean: 2.1999934510124293 usec\nrounds: 150558"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 457310.613047865,
            "unit": "iter/sec",
            "range": "stddev: 4.04347548385344e-7",
            "extra": "mean: 2.1866975562522835 usec\nrounds: 144655"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.70523428217559,
            "unit": "iter/sec",
            "range": "stddev: 0.002451196521880946",
            "extra": "mean: 17.95163440000067 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 54.760738723242305,
            "unit": "iter/sec",
            "range": "stddev: 0.0010220172065463903",
            "extra": "mean: 18.261258399999747 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 34.9722468292776,
            "unit": "iter/sec",
            "range": "stddev: 0.009996967159093225",
            "extra": "mean: 28.594102200000293 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 464113.3629820798,
            "unit": "iter/sec",
            "range": "stddev: 4.788287351538235e-7",
            "extra": "mean: 2.154645997638753 usec\nrounds: 164691"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1057619.0878276723,
            "unit": "iter/sec",
            "range": "stddev: 3.558710321308552e-7",
            "extra": "mean: 945.5200000729747 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 207109.23147069683,
            "unit": "iter/sec",
            "range": "stddev: 0.0000011808954027254454",
            "extra": "mean: 4.828370000211635 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4691.925504794396,
            "unit": "iter/sec",
            "range": "stddev: 0.000011753281048696095",
            "extra": "mean: 213.13211366594805 usec\nrounds: 4610"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4558.46922595057,
            "unit": "iter/sec",
            "range": "stddev: 0.000006909206607592801",
            "extra": "mean: 219.3718878932372 usec\nrounds: 4353"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2947.1704222416224,
            "unit": "iter/sec",
            "range": "stddev: 0.000018852210724112742",
            "extra": "mean: 339.30850840970317 usec\nrounds: 2616"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2804.3050223001997,
            "unit": "iter/sec",
            "range": "stddev: 0.000011091805236485495",
            "extra": "mean: 356.59459012050024 usec\nrounds: 2652"
          }
        ]
      }
    ]
  }
}