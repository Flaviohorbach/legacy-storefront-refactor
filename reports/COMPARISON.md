# Lighthouse: before and after

Mobile profile, simulated slow 4G, median of 3 runs per page, both sites served by the same static server with gzip (`scripts/serve.mjs`). The modern cart and checkout are measured with 3 items in the cart, like the hard-coded legacy pages.

| Metric | home before → after | shop before → after | product before → after | cart before → after | checkout before → after |
| --- | --- | --- | --- | --- | --- |
| Performance | 70 → **97** | 83 → **97** | 87 → **96** | 88 → **96** | 93 → **100** |
| Accessibility | 87 → **100** | 82 → **98** | 77 → **100** | 84 → **100** | 73 → **100** |
| Best practices | 96 → **100** | 100 → **100** | 96 → **100** | 100 → **100** | 100 → **100** |
| SEO | 100 → **100** | 100 → **100** | 100 → **100** | 100 → **100** | 91 → **100** |
| LCP | 6.9 s → **2.6 s** | 4.5 s → **2.5 s** | 3.9 s → **2.7 s** | 3.7 s → **2.7 s** | 3.0 s → **0.8 s** |
| FCP | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** |
| Total blocking time | 164 ms → **0 ms** | 49 ms → **12 ms** | 7 ms → **0 ms** | 24 ms → **0 ms** | 8 ms → **4 ms** |
| CLS | 0.000 → **0.001** | 0.000 → **0.007** | 0.000 → **0.001** | 0.001 → **0.003** | 0.000 → **0.000** |
| Requests | 47 → **17** | 38 → **33** | 42 → **10** | 29 → **8** | 29 → **7** |
| Transferred | 1057 KB → **348 KB** | 547 KB → **446 KB** | 838 KB → **470 KB** | 384 KB → **175 KB** | 383 KB → **160 KB** |
