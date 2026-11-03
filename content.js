// Preview writing is deliberately marked as draft copy, ready for Tim to edit.
export const posts = [
  {
    slug: 'radical-simplification', title: 'The best code is the code you can remove.',
    category: 'Engineering', date: '2026-11-02', minutes: 4,
    summary: 'A working note on finding the small idea hiding inside a complicated system.',
    paragraphs: [
      'A good abstraction makes the work underneath it easier to understand. When an abstraction needs another abstraction to explain it, it is worth stepping back.',
      'Start with the requirement. What does the system actually have to do? Then look for the shortest path between that requirement and the resources that can satisfy it. Ordinary ownership, a direct call, and a well-defined lifetime often do more than a new protocol or another background service.',
      'Simplification is not a competition to write the fewest characters. It is the work of removing decisions a reader should not have to make. A little more code can be simpler when it makes ownership obvious or turns an assumption into a structural guarantee.',
      'Measure what remains. An attractive design can still hide an expensive copy or a serial handoff. Use a real workload to find the cost, change one thing, and keep the simpler version when it is still correct.',
      'The question I keep coming back to is: what can disappear without losing the thing we actually need?'
    ]
  },
  {
    slug: 'a-small-runtime-with-clear-boundaries', title: 'A small runtime. Clear boundaries.',
    category: 'Runtimes', date: '2026-11-02', minutes: 3,
    summary: 'The idea behind a native host that lets JavaScript ask for only what it needs.',
    paragraphs: [
      'Operating systems offer a useful way to think about an application runtime. A program does not need to understand a storage controller to read a file. It asks for an operation through a small, explicit interface.',
      'Jam takes a similar approach. The native Rust host owns HTTP, TLS, network bodies and SQLite. JavaScript handles application decisions through web APIs and typed native calls. A body can travel from one native connection to another without first becoming a JavaScript byte array.',
      'That boundary should be useful to the programmer. Header names should behave like header names, rather than making every application rediscover case folding and duplicate-header rules. Resources should have a clear owner, and work left behind by a finished request should have a clear end.',
      'This site is an opportunity to try that model with real routes, forms, content and database writes. The implementation stays small so problems in the runtime remain visible.'
    ]
  },
  {
    slug: 'measure-the-work-you-actually-do', title: 'Measure the work you actually do.',
    category: 'Performance', date: '2026-11-02', minutes: 3,
    summary: 'A tiny response is useful. It is not the whole application.',
    paragraphs: [
      'A hello-world benchmark is good at finding fixed request overhead. It says less about an upload, a database-backed page, a large response, or a mixture of fast and slow requests.',
      'Useful measurements start with a question. Keep the environment and workload matched, alternate the implementations, validate the responses, and retain the samples. A fast error is still an error.',
      'Look at throughput, latency, CPU time and memory together. Lower throughput with similar CPU cost may point toward coordination. A large byte response may expose copying that a tiny response never exercises. None of those observations identifies a cause on its own.',
      'A result that changes direction across paired runs deserves the word inconclusive. The next step is a narrower experiment, not a more confident headline.'
    ]
  }
];

export const projects = [
  { name: 'Jam', repo: 'mjackson/jam', category: 'Runtimes', language: 'Rust / JavaScript', mark: 'J', description: 'A JavaScript application server with a native Rust host, V8 workers and direct SQLite access.', featured: true },
  { name: 'Luvit', repo: 'luvit/luvit', category: 'Runtimes', language: 'Lua / C', mark: 'L', description: 'Asynchronous I/O for Lua, bringing together LuaJIT and libuv.', featured: true },
  { name: 'js-git', repo: 'creationix/js-git', category: 'Tools', language: 'JavaScript', mark: 'g', description: 'Git implementations and building blocks written in JavaScript.', featured: true },
  { name: 'Luvi', repo: 'luvit/luvi', category: 'Runtimes', language: 'C / Lua', mark: 'λ', description: 'A compact foundation for packaging and running Lua applications.' },
  { name: 'Architect', repo: 'c9/architect', category: 'Foundations', language: 'JavaScript', mark: 'a', description: 'A small plugin system for composing applications from independent parts.', archived: true },
  { name: 'Smith', repo: 'c9/smith', category: 'Foundations', language: 'JavaScript', mark: 's', description: 'RPC building blocks created for the Cloud9 development environment.', archived: true },
  { name: 'VFS', repo: 'c9/vfs', category: 'Foundations', language: 'JavaScript', mark: '/', description: 'A virtual filesystem interface created for Cloud9.', archived: true }
];
