window.BENCHMARK_DATA = {
  "lastUpdate": 1770839742789,
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
      },
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
          "id": "161175e7c0da83d8944caedf2c5f4d23a5f280a5",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-10T04:19:28Z",
          "url": "https://github.com/albertobadia/zoocache/pull/4/commits/161175e7c0da83d8944caedf2c5f4d23a5f280a5"
        },
        "date": 1770839742241,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 445548.1989650248,
            "unit": "iter/sec",
            "range": "stddev: 5.167157288462968e-7",
            "extra": "mean: 2.2444260852651303 usec\nrounds: 15687"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.780325421276698,
            "unit": "iter/sec",
            "range": "stddev: 0.0001197184373654743",
            "extra": "mean: 102.24608659999603 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 159263.31158413884,
            "unit": "iter/sec",
            "range": "stddev: 0.000006324109721933553",
            "extra": "mean: 6.27891000164027 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.45469534586755,
            "unit": "iter/sec",
            "range": "stddev: 0.00005533143930891771",
            "extra": "mean: 6.007640685185551 msec\nrounds: 162"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.07448859327815,
            "unit": "iter/sec",
            "range": "stddev: 0.00003990610771405705",
            "extra": "mean: 5.553257475902826 msec\nrounds: 166"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.43457240232232,
            "unit": "iter/sec",
            "range": "stddev: 0.000037530532068268975",
            "extra": "mean: 5.57306201704448 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1371.0494827758168,
            "unit": "iter/sec",
            "range": "stddev: 0.00001632526890750822",
            "extra": "mean: 729.3682777775514 usec\nrounds: 1242"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 156.5580328220213,
            "unit": "iter/sec",
            "range": "stddev: 0.00009969801484327068",
            "extra": "mean: 6.387407799999778 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6383.341405784827,
            "unit": "iter/sec",
            "range": "stddev: 0.000009408887280639292",
            "extra": "mean: 156.65776533490157 usec\nrounds: 4956"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5272.381163958264,
            "unit": "iter/sec",
            "range": "stddev: 0.000012800226199858997",
            "extra": "mean: 189.6676224465618 usec\nrounds: 4259"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.77726112752288,
            "unit": "iter/sec",
            "range": "stddev: 0.00021289151578080185",
            "extra": "mean: 5.721568089285763 msec\nrounds: 56"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 109.1733248675468,
            "unit": "iter/sec",
            "range": "stddev: 0.0004450750175103019",
            "extra": "mean: 9.15974667999933 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 463705.73183762014,
            "unit": "iter/sec",
            "range": "stddev: 4.4032675759450253e-7",
            "extra": "mean: 2.156540088553787 usec\nrounds: 114983"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 455425.0080919691,
            "unit": "iter/sec",
            "range": "stddev: 4.461411328529602e-7",
            "extra": "mean: 2.1957511823726175 usec\nrounds: 184163"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 455319.5663257916,
            "unit": "iter/sec",
            "range": "stddev: 4.4024175876248604e-7",
            "extra": "mean: 2.19625966893871 usec\nrounds: 168322"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 453167.66591767315,
            "unit": "iter/sec",
            "range": "stddev: 4.655705885784912e-7",
            "extra": "mean: 2.2066887715278205 usec\nrounds: 148987"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 455780.71990790206,
            "unit": "iter/sec",
            "range": "stddev: 4.3205528365408166e-7",
            "extra": "mean: 2.1940375191870034 usec\nrounds: 120978"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 451166.2587483977,
            "unit": "iter/sec",
            "range": "stddev: 4.745165584730516e-7",
            "extra": "mean: 2.21647780748088 usec\nrounds: 144238"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.163426339409526,
            "unit": "iter/sec",
            "range": "stddev: 0.0022123907643001035",
            "extra": "mean: 18.127953000004027 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 53.83373266479899,
            "unit": "iter/sec",
            "range": "stddev: 0.0017151247655437995",
            "extra": "mean: 18.57571359999497 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.71638280301032,
            "unit": "iter/sec",
            "range": "stddev: 0.010501213164005424",
            "extra": "mean: 27.235798399999567 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 464704.29914715956,
            "unit": "iter/sec",
            "range": "stddev: 4.723284569093883e-7",
            "extra": "mean: 2.151906065502799 usec\nrounds: 189036"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 959867.9238986935,
            "unit": "iter/sec",
            "range": "stddev: 3.851448803857391e-7",
            "extra": "mean: 1.0418099981279738 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 205614.93252977935,
            "unit": "iter/sec",
            "range": "stddev: 0.000001209360390269582",
            "extra": "mean: 4.863460001161002 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4661.310799446671,
            "unit": "iter/sec",
            "range": "stddev: 0.000024067417048477186",
            "extra": "mean: 214.5319295419449 usec\nrounds: 2356"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4603.78698520626,
            "unit": "iter/sec",
            "range": "stddev: 0.000006493304364320018",
            "extra": "mean: 217.21248250915713 usec\nrounds: 4431"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3026.463217694313,
            "unit": "iter/sec",
            "range": "stddev: 0.000007373493003528448",
            "extra": "mean: 330.41868612625734 usec\nrounds: 2912"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2899.0788942292343,
            "unit": "iter/sec",
            "range": "stddev: 0.000016633405270925426",
            "extra": "mean: 344.93714606751524 usec\nrounds: 2670"
          }
        ]
      }
    ]
  }
}