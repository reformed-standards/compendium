#!/usr/bin/env python3
"""
A simple validation script for data files

We want all data files to conform to a common spec.  This way we can ensure
consistency across the board.
"""
import os
import yaml
import sys

DOCUMENT_TYPES = [
    'confession',
    'catechism',
    'psalter',
    'document',
    'creed',
    'psalm-index'
]


def find_files(data_dir):
    files = os.walk(data_dir)

    for (dirpath, dirnames, filenames) in files:
        for filename in filenames:
            if filename.endswith('yaml'):
                yield os.path.join(dirpath, filename)


def read_yaml_file(filename):
    data = open(filename).read()
    return yaml.load(data, Loader=yaml.Loader)

def _validate_verses(text_w_ref, obj):
    for ref in obj['verses']:
        assert '[' + str(ref) + ']' in text_w_ref, 'Missing Citation ' + str(ref) + ' from ' + str(obj['number'])

def validate_confession(data):
    for chapter in data['chapters']:
        assert isinstance(chapter, dict), 'Chapter not a dict'

        assert 'name' in chapter, 'Missing chapter name'
        assert 'number' in chapter, 'Missing chapter number'

        assert isinstance(chapter['name'], str), \
            'Chapter name not a string'
        assert isinstance(chapter['number'], int), \
            'Chapter number not an int'

        if 'articles' not in chapter:
            continue

        assert isinstance(chapter['articles'], list), \
            'Articles not a list'

        for article in chapter['articles']:
            assert isinstance(article, dict), 'Article not a dict'
            if 'verses' in article:
                _validate_verses(article['text'], article)

            assert 'number' in article, 'Missing article number'
            assert 'text' in article, 'Missing text in article'

            assert isinstance(article['number'], int), \
                'Article number not an int'
            assert isinstance(article['text'], str), \
                'Article text not a string'


def _validate_question(question):
    assert isinstance(question, dict), 'Question not a dict'

    assert 'question' in question, 'Missing question'
    assert 'answer' in question, 'Missing answer'
    assert 'number' in question, 'Missing question number'

    assert isinstance(question['question'], str), \
        'Question not a string'
    assert isinstance(question['answer'], str), \
        'Answer not a string'
    assert isinstance(question['number'], int), \
        'Question number not an int'
    if 'verses' in question:
        _validate_verses(question['answer'] + question['question'], question)


def validate_catechism(data):
    if 'days' in data:
        for day in data['days']:
            for question in day['questions']:
                _validate_question(question)
    else:
        for question in data['questions']:
            _validate_question(question)


def validate_file(filename):
    print('Validating', filename)
    try:
        data = read_yaml_file(filename)
        assert isinstance(data, dict), 'File is not a dict'

        assert 'name' in data.keys(), 'Name missing'
        assert 'type' in data.keys(), 'Type is missing'

        if data['type'] != 'creed':
            assert 'publication_year' in data.keys(), 'Year is missing'

        assert data['type'] in DOCUMENT_TYPES, 'Invalid type'

        if data['type'] in ['document', 'psalter', 'creed', 'psalm-index']:
            return

        assert any([
            'questions' in data,  # Checking for a catechism
            'chapters' in data,   # Checking for a confession
            'days' in data        # Checking for Heidelberg
        ]), 'Missing questions or chapters'

        if 'chapters' in data:
            validate_confession(data)

        if 'questions' in data:
            validate_catechism(data)

        if 'days' in data:
            validate_catechism(data)

    except Exception as err:
        return err


def main(data_dir):
    files = find_files(data_dir)
    failures = 0

    for f in files:
        err = validate_file(f)

        if err:
            print('FAIL', f, err)
            failures += 1

    if not failures:
        print('All files successfully validated.')
    else:
        sys.exit(1)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--data-dir', action='store',
                        dest='data_dir', default='data')
    args = parser.parse_args()
    main(args.data_dir)
