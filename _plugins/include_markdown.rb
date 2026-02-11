Jekyll::Hooks.register :pages, :pre_render do |page, payload|
  site = page.site
  config = site.config

  # Match {% include-markdown "file.md" %} or {% include-markdown "../file.md" start="marker" %}
  pattern = /{%\s*include-markdown\s+(?:["']([^"']+)["']|([^\s%}]+))\s*(.*?)?\s*%}/

  page.content = page.content.gsub(pattern) do |match|
    file_path = ($1 || $2).strip.gsub(['"', "'"], '')
    options_str = $3 || ''

    # Parse options
    options = {}
    options_str.scan(/(\w+)=["']([^"']+)["']/).each do |key, value|
      options[key.to_sym] = value
    end

    # Handle relative paths from docs directory
    if file_path.start_with?('../')
      base_path = File.dirname(page.path)
      full_path = File.expand_path(file_path, File.join(site.source, base_path))
    elsif file_path.start_with?('/')
      full_path = File.join(site.source, file_path)
    else
      full_path = File.join(File.dirname(page.path), file_path)
    end

    if File.exist?(full_path)
      content = File.read(full_path)

      # Handle start/end markers
      if options[:start]
        start_marker = options[:start]
        end_marker = options[:end] || nil

        if end_marker
          content = content[content.index(start_marker)..content.index(end_marker)] if content.index(start_marker) && content.index(end_marker)
        else
          content = content[content.index(start_marker)..-1] if content.index(start_marker)
        end
      end

      content
    else
      "<!-- include-markdown file not found: #{file_path} -->"
    end
  end
end
