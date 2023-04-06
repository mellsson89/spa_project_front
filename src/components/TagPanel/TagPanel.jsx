import React from 'react';
import {Button} from "@mui/material";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import AddLinkIcon from '@mui/icons-material/AddLink';
import CodeIcon from '@mui/icons-material/Code';

const TagPanel = ({id}) => {

    const tags = [
        { name: 'i', label: <FormatItalicIcon fontSize='small'/> },
        { name: 'strong', label: <FormatBoldIcon fontSize='small'/> },
        { name: 'code', label: <CodeIcon fontSize='medium'/> },
        { name: 'a', label: <AddLinkIcon fontSize='medium'/> },
    ];

    const handleTagClick = (tagName) => {

        let tag;
        const textField = document.getElementById(id);
        const start = textField.selectionStart;
        const end = textField.selectionEnd;
        const value = textField.value;

        if(tagName === 'a') {
            tag = `<${tagName} href="" title=""></${tagName}>`;
        } else {
            tag = `<${tagName}></${tagName}>`;
        }

        const newValue = `${value.substring(0, start)}${tag}${value.substring(end)}`;
        textField.value = newValue;
        textField.focus();

    };


    return (
        <div style={{textAlign:'center'}}>
            {tags.map((tag) => (
                <Button key={tag.name} onClick={() => handleTagClick(tag.name)}>
                    {tag.label}
                </Button>
            ))}
        </div>
    );
};

export default TagPanel;