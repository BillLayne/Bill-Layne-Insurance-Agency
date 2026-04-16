"""Add for/id label associations to service-center.html forms."""
import re

with open('service-center.html', 'r', encoding='utf-8') as fp:
    c = fp.read()

# Form 1: policyChangeForm (lines ~727-760ish) uses prefix 'policy-'
# Form 2: idCardForm (lines ~817-870ish) uses prefix 'idcard-'

# Split content at the form boundary so each form's fields get the right prefix
m = re.search(r'<form id="idCardForm"', c)
if not m:
    print('ERROR: could not find idCardForm split point')
    raise SystemExit(1)

policy_section = c[:m.start()]
idcard_section = c[m.start():]

def add_ids(section, prefix):
    """Add id=prefix-name to inputs and for=prefix-name to preceding labels."""
    # Pattern: label followed by input with name="X"
    def repl(match):
        label_tag = match.group(1)
        label_text = match.group(2)
        input_tag = match.group(3)
        name = match.group(4)
        input_rest = match.group(5)
        input_id = f'{prefix}-{name}'

        # Insert for=... into label
        new_label = re.sub(
            r'<label\b',
            f'<label for="{input_id}"',
            label_tag,
            count=1,
        )
        # Insert id=... into input after type
        new_input = re.sub(
            r'(<input\s)',
            f'\\1id="{input_id}" ',
            input_tag,
            count=1,
        )
        return f'{new_label}>{label_text}</label>\n                                        {new_input}name="{name}"{input_rest}'

    # Labels can contain nested <span> for required markers; match non-greedily up to </label>
    pattern = re.compile(
        r'(<label\b[^>]*)>(.*?)</label>\s*(<input\s[^>]*?)name="([^"]+)"([^>]*>)',
        re.DOTALL,
    )
    return pattern.sub(repl, section)

new_policy = add_ids(policy_section, 'policy')
new_idcard = add_ids(idcard_section, 'idcard')

new_content = new_policy + new_idcard

if new_content != c:
    with open('service-center.html', 'w', encoding='utf-8') as fp:
        fp.write(new_content)
    # Count how many ids we added
    added_ids = len(re.findall(r'id="(policy|idcard)-', new_content)) - len(re.findall(r'id="(policy|idcard)-', c))
    print(f'OK - added {added_ids} id/for associations')
else:
    print('No changes made')
