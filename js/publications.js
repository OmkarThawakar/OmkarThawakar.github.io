(() => {
  const records = Array.from(document.querySelectorAll('.pub-item'));
  const categories = Array.from(document.querySelectorAll('.pub-category'));

  if (!records.length) return;

  const metadata = [
    [2025, ['patent', 'video instance segmentation', 'spatio-temporal transformers']],
    [2025, ['patent', 'video instance segmentation', 'recurrent transformers']],
    [2026, ['medical AI', 'longitudinal MRI', 'foundation models', 'disease progression reasoning']],
    [2026, ['large multimodal models', 'visual tokens', 'self-evolving AI']],
    [2026, ['composed video retrieval', 'visual reasoning', 'multimodal retrieval']],
    [2026, ['large multimodal models', 'self-evolving AI', 'continuous rewards']],
    [2026, ['large language models', 'post-training', 'reasoning']],
    [2026, ['fine-grained recognition', 'open vocabulary', 'visual reasoning']],
    [2026, ['medical AI', 'MRI anomaly segmentation', 'multi-agent diffusion', 'LoRA specialization']],
    [2026, ['Arabic calligraphy', 'multimodal benchmark', 'cultural AI']],
    [2025, ['composed video retrieval', 'dense modifications', 'video understanding']],
    [2025, ['visual reasoning', 'large multimodal models', 'step-by-step reasoning']],
    [2025, ['cultural heritage', 'multimodal benchmark', 'artifact understanding']],
    [2025, ['efficient LLMs', 'mobile AI', 'language models']],
    [2025, ['multilingual AI', 'large multimodal models', 'cultural diversity']],
    [2024, ['composed video retrieval', 'multimodal retrieval', 'video understanding']],
    [2025, ['Arabic AI', 'large multimodal models', 'benchmark']],
    [2025, ['Arabic poetry', 'cultural AI', 'benchmark']],
    [2024, ['medical AI', 'chest radiographs', 'vision-language models']],
    [2023, ['3D segmentation', 'mitochondria', 'spatio-temporal transformers']],
    [2023, ['video instance segmentation', 'recurrent transformers', 'video understanding']],
    [2022, ['video instance segmentation', 'spatio-temporal attention', 'transformers']],
    [2024, ['open-world learning', 'video instance segmentation', 'object discovery']],
    [2019, ['video super-resolution', 'generative adversarial networks', 'image restoration']],
    [2019, ['underwater vision', 'moving object segmentation', 'generative adversarial networks']],
    [2026, ['mobile AI', 'multimodal generation', 'on-device models']],
    [2025, ['Arabic AI', 'large multimodal models', 'inclusive AI']],
    [2024, ['image restoration', 'dynamic pre-training', 'efficient learning']]
  ];

  const searchInput = document.querySelector('#publication-search');
  const yearSelect = document.querySelector('#publication-year');
  const orderSelect = document.querySelector('#publication-order');
  const filterForm = document.querySelector('#publication-filters');
  const tabs = document.querySelector('#publication-year-tabs');
  const resultCount = document.querySelector('#publication-result-count');
  const emptyState = document.querySelector('#publication-empty');

  records.forEach((record, index) => {
    const [year, keywords] = metadata[index] || [0, ['research']];
    record.dataset.year = String(year);
    record.dataset.keywords = keywords.join(' ');
    record.dataset.originalIndex = String(index);

    const keywordList = document.createElement('div');
    keywordList.className = 'pub-keywords';
    keywordList.setAttribute('aria-label', 'Research keywords');

    keywords.forEach((keyword) => {
      const tag = document.createElement('button');
      tag.className = 'pub-keyword';
      tag.type = 'button';
      tag.textContent = keyword;
      tag.addEventListener('click', () => {
        searchInput.value = keyword;
        applyFilters();
        searchInput.focus();
      });
      keywordList.appendChild(tag);
    });

    const venue = record.querySelector('.pub-venue');
    if (venue) venue.insertAdjacentElement('afterend', keywordList);
  });

  const years = [...new Set(records.map((record) => Number(record.dataset.year)).filter(Boolean))]
    .sort((a, b) => b - a);

  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  });

  const addYearTab = (value, label) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.year = value;
    button.textContent = label;
    button.setAttribute('aria-pressed', value === 'all' ? 'true' : 'false');
    button.addEventListener('click', () => {
      yearSelect.value = value;
      applyFilters();
    });
    item.appendChild(button);
    tabs.appendChild(item);
  };

  addYearTab('all', 'All years');
  years.forEach((year) => addYearTab(String(year), String(year)));

  document.querySelector('#publication-total').textContent = String(records.length);
  document.querySelector('#publication-year-count').textContent = String(years.length);
  document.querySelector('#publication-year-range').textContent = `${years.at(-1)}–${years[0]}`;
  document.querySelector('#publication-section-count').textContent = String(categories.length);

  const categoryGroups = categories.map((heading) => {
    const items = [];
    let sibling = heading.nextElementSibling;
    let boundary = null;
    while (sibling && !sibling.classList.contains('pub-category')) {
      if (sibling.classList.contains('pub-item')) {
        items.push(sibling);
      } else if (items.length) {
        boundary = sibling;
        break;
      }
      sibling = sibling.nextElementSibling;
    }
    return { heading, items, boundary: boundary || sibling };
  });

  const normalize = (value) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  function sortRecords() {
    const order = orderSelect.value;
    categoryGroups.forEach(({ heading, items, boundary }) => {
      const sorted = [...items].sort((a, b) => {
        if (order === 'title') {
          return a.querySelector('.pub-title').textContent.localeCompare(b.querySelector('.pub-title').textContent);
        }
        const yearDifference = Number(b.dataset.year) - Number(a.dataset.year);
        if (yearDifference) return order === 'oldest' ? -yearDifference : yearDifference;
        return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
      });
      sorted.forEach((item) => heading.parentElement.insertBefore(item, boundary));
    });
  }

  function applyFilters() {
    const query = normalize(searchInput.value);
    const queryTerms = query.split(' ').filter(Boolean);
    const selectedYear = yearSelect.value;
    let visibleCount = 0;

    records.forEach((record) => {
      const searchableText = normalize(`${record.textContent} ${record.dataset.keywords}`);
      const matchesQuery = queryTerms.every((term) => searchableText.includes(term));
      const matchesYear = selectedYear === 'all' || record.dataset.year === selectedYear;
      const visible = matchesQuery && matchesYear;
      record.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    categoryGroups.forEach(({ heading, items }) => {
      heading.hidden = !items.some((item) => !item.hidden);
    });

    tabs.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.year === selectedYear));
    });

    sortRecords();
    resultCount.textContent = `Showing ${visibleCount} of ${records.length} publications`;
    emptyState.hidden = visibleCount !== 0;
  }

  searchInput.addEventListener('input', applyFilters);
  yearSelect.addEventListener('change', applyFilters);
  orderSelect.addEventListener('change', applyFilters);
  filterForm.addEventListener('reset', () => {
    window.requestAnimationFrame(applyFilters);
  });

  applyFilters();
})();
