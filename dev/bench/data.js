window.BENCHMARK_DATA = {
  "lastUpdate": 1770838509164,
  "repoUrl": "https://github.com/albertobadia/zoocache",
  "entries": {
    "Python Benchmark": [
      {
        "commit": {
          "author": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "committer": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "id": "86f83ec7521c86c8ef2543b3b295730429efcd30",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-10T04:19:28Z",
          "url": "https://github.com/albertobadia/zoocache/pull/4/commits/86f83ec7521c86c8ef2543b3b295730429efcd30"
        },
        "date": 1770838508832,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 438705.6518258644,
            "unit": "iter/sec",
            "range": "stddev: 4.864378864097936e-7",
            "extra": "mean: 2.2794326807463388 usec\nrounds: 14253"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.76873157112005,
            "unit": "iter/sec",
            "range": "stddev: 0.0001117642914384801",
            "extra": "mean: 102.3674355999674 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 93906.1482841466,
            "unit": "iter/sec",
            "range": "stddev: 0.000008645087518891056",
            "extra": "mean: 10.648930003753776 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.3535145454836,
            "unit": "iter/sec",
            "range": "stddev: 0.000046835972308930175",
            "extra": "mean: 6.011294698114626 msec\nrounds: 159"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.74621912375667,
            "unit": "iter/sec",
            "range": "stddev: 0.00004949247945612046",
            "extra": "mean: 5.563399357576985 msec\nrounds: 165"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.51915910839938,
            "unit": "iter/sec",
            "range": "stddev: 0.000056444897413725915",
            "extra": "mean: 5.570436074715391 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1356.058798503032,
            "unit": "iter/sec",
            "range": "stddev: 0.0000177787100950349",
            "extra": "mean: 737.4311505547628 usec\nrounds: 1262"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 154.12611563596812,
            "unit": "iter/sec",
            "range": "stddev: 0.00009771393889564778",
            "extra": "mean: 6.488193100005901 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6189.30013582363,
            "unit": "iter/sec",
            "range": "stddev: 0.000011081662695276021",
            "extra": "mean: 161.56915613317997 usec\nrounds: 4778"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5136.644351764549,
            "unit": "iter/sec",
            "range": "stddev: 0.000011795368714949106",
            "extra": "mean: 194.6796257475911 usec\nrounds: 4179"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 168.9941468382655,
            "unit": "iter/sec",
            "range": "stddev: 0.0004251202052819613",
            "extra": "mean: 5.91736470587376 msec\nrounds: 51"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 87.5075938870963,
            "unit": "iter/sec",
            "range": "stddev: 0.0009119321780526514",
            "extra": "mean: 11.427579660003175 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 467951.93093508546,
            "unit": "iter/sec",
            "range": "stddev: 4.4132470178216377e-7",
            "extra": "mean: 2.1369716286921796 usec\nrounds: 72538"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 463700.38441049564,
            "unit": "iter/sec",
            "range": "stddev: 4.79533392713467e-7",
            "extra": "mean: 2.1565649579335684 usec\nrounds: 148965"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 450017.87052910164,
            "unit": "iter/sec",
            "range": "stddev: 0.0000012587078659267468",
            "extra": "mean: 2.2221339762002454 usec\nrounds: 170620"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 450926.2323437158,
            "unit": "iter/sec",
            "range": "stddev: 9.856803261639669e-7",
            "extra": "mean: 2.2176576306116433 usec\nrounds: 154751"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 451833.9011362961,
            "unit": "iter/sec",
            "range": "stddev: 6.180308537869142e-7",
            "extra": "mean: 2.2132026779866374 usec\nrounds: 137874"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 461390.5252987589,
            "unit": "iter/sec",
            "range": "stddev: 4.6751080941359666e-7",
            "extra": "mean: 2.1673613677967953 usec\nrounds: 123229"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 56.05462294309095,
            "unit": "iter/sec",
            "range": "stddev: 0.002299804457296461",
            "extra": "mean: 17.839741799980402 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 52.70220267278591,
            "unit": "iter/sec",
            "range": "stddev: 0.0006670833578805909",
            "extra": "mean: 18.97453899998709 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 32.9102005225974,
            "unit": "iter/sec",
            "range": "stddev: 0.012497590951079161",
            "extra": "mean: 30.385715799980062 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 467940.0232602797,
            "unit": "iter/sec",
            "range": "stddev: 4.478146397115301e-7",
            "extra": "mean: 2.1370260082322035 usec\nrounds: 176367"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 980171.1328615798,
            "unit": "iter/sec",
            "range": "stddev: 3.2417390490796336e-7",
            "extra": "mean: 1.0202300052242208 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 197502.38472082742,
            "unit": "iter/sec",
            "range": "stddev: 0.000002251881174489095",
            "extra": "mean: 5.0632300030883926 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4795.590681592382,
            "unit": "iter/sec",
            "range": "stddev: 0.000005828179269754587",
            "extra": "mean: 208.5248859621082 usec\nrounds: 4709"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4610.655226108082,
            "unit": "iter/sec",
            "range": "stddev: 0.000007100414758640251",
            "extra": "mean: 216.8889129548109 usec\nrounds: 3929"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3030.6741648910875,
            "unit": "iter/sec",
            "range": "stddev: 0.000015079909353186836",
            "extra": "mean: 329.95958839274846 usec\nrounds: 2636"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2900.6015596901657,
            "unit": "iter/sec",
            "range": "stddev: 0.00000791110832826794",
            "extra": "mean: 344.756071946268 usec\nrounds: 2210"
          }
        ]
      }
    ]
  }
}