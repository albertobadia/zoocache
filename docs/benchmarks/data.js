window.BENCHMARK_DATA = {
  "lastUpdate": 1770843381931,
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
          "id": "87301082a129a15639610e65b0681a6c71273e3a",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-10T04:19:28Z",
          "url": "https://github.com/albertobadia/zoocache/pull/4/commits/87301082a129a15639610e65b0681a6c71273e3a"
        },
        "date": 1770843381315,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 451483.241846587,
            "unit": "iter/sec",
            "range": "stddev: 4.378727566744655e-7",
            "extra": "mean: 2.2149216345438525 usec\nrounds: 16053"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.78708996159609,
            "unit": "iter/sec",
            "range": "stddev: 0.00017406663214195546",
            "extra": "mean: 102.17541719999872 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 114125.80773987433,
            "unit": "iter/sec",
            "range": "stddev: 0.000005818869249759834",
            "extra": "mean: 8.762259998889022 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.64832042252442,
            "unit": "iter/sec",
            "range": "stddev: 0.00005816606647238746",
            "extra": "mean: 6.000660537499414 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.02178028445144,
            "unit": "iter/sec",
            "range": "stddev: 0.0000550859375731632",
            "extra": "mean: 5.554883405885141 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 180.00156765937015,
            "unit": "iter/sec",
            "range": "stddev: 0.000045903587192507546",
            "extra": "mean: 5.555507171428482 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1361.7379324480828,
            "unit": "iter/sec",
            "range": "stddev: 0.000013752740612005324",
            "extra": "mean: 734.3556907475115 usec\nrounds: 1232"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 157.32858331097637,
            "unit": "iter/sec",
            "range": "stddev: 0.00009883663607443612",
            "extra": "mean: 6.356124099988847 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6314.959303687899,
            "unit": "iter/sec",
            "range": "stddev: 0.000009771657260888805",
            "extra": "mean: 158.3541479698857 usec\nrounds: 4778"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5155.9981819791265,
            "unit": "iter/sec",
            "range": "stddev: 0.000016129322272953655",
            "extra": "mean: 193.94886590440004 usec\nrounds: 4109"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.8719085128879,
            "unit": "iter/sec",
            "range": "stddev: 0.0003032402108347787",
            "extra": "mean: 5.718471357143683 msec\nrounds: 56"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 109.46938607837437,
            "unit": "iter/sec",
            "range": "stddev: 0.00044315433352525664",
            "extra": "mean: 9.134974039993722 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 474962.35728935944,
            "unit": "iter/sec",
            "range": "stddev: 4.1517145247311857e-7",
            "extra": "mean: 2.105430008615975 usec\nrounds: 129116"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 454497.25221796625,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010079545358242754",
            "extra": "mean: 2.200233324007916 usec\nrounds: 175717"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 464511.0045946292,
            "unit": "iter/sec",
            "range": "stddev: 4.1711690671963794e-7",
            "extra": "mean: 2.1528015270008143 usec\nrounds: 151930"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 452578.5787891237,
            "unit": "iter/sec",
            "range": "stddev: 8.827260185697122e-7",
            "extra": "mean: 2.209561050537357 usec\nrounds: 155232"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 460182.5863311038,
            "unit": "iter/sec",
            "range": "stddev: 4.1921363230488755e-7",
            "extra": "mean: 2.1730505014818067 usec\nrounds: 141184"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 467228.8877825331,
            "unit": "iter/sec",
            "range": "stddev: 4.969900335212959e-7",
            "extra": "mean: 2.140278621782136 usec\nrounds: 124922"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 57.451096391521965,
            "unit": "iter/sec",
            "range": "stddev: 0.002454995650144388",
            "extra": "mean: 17.406108200009385 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 54.07057451432827,
            "unit": "iter/sec",
            "range": "stddev: 0.0002722099005323399",
            "extra": "mean: 18.494347600005767 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.505925576139035,
            "unit": "iter/sec",
            "range": "stddev: 0.009421896683516054",
            "extra": "mean: 27.39281319999236 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 475392.4791152373,
            "unit": "iter/sec",
            "range": "stddev: 4.2281607825686357e-7",
            "extra": "mean: 2.1035250743998315 usec\nrounds: 182816"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 972081.8097397372,
            "unit": "iter/sec",
            "range": "stddev: 3.709410077586068e-7",
            "extra": "mean: 1.0287200007041974 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 195297.62379205928,
            "unit": "iter/sec",
            "range": "stddev: 0.000001941016290583699",
            "extra": "mean: 5.120390000570296 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4749.047755424509,
            "unit": "iter/sec",
            "range": "stddev: 0.00000606762900588709",
            "extra": "mean: 210.56852899779102 usec\nrounds: 4690"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4697.397604350984,
            "unit": "iter/sec",
            "range": "stddev: 0.000006348885741362572",
            "extra": "mean: 212.88383148016808 usec\nrounds: 4587"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2964.719478380817,
            "unit": "iter/sec",
            "range": "stddev: 0.0000063563613772861495",
            "extra": "mean: 337.3000404564922 usec\nrounds: 2892"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2860.374042351406,
            "unit": "iter/sec",
            "range": "stddev: 0.000007244664562465328",
            "extra": "mean: 349.60462694520106 usec\nrounds: 2828"
          }
        ]
      }
    ]
  }
}