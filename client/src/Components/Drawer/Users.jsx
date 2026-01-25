import * as React from "react";
import { styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";

const ListContainer = styled("div")({
    width: "10%",
    position: "absolute",
    top: "21px",
    marginLeft: "20px",
    zIndex: 9999,
});

export default function User({ users = [] }) {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListContainer>
                {!open && (
                    <ListOutlinedIcon
                        sx={{ color: "white", cursor: "pointer" }}
                        onClick={toggleDrawer}
                    />
                )}
            </ListContainer>

            <Drawer
                anchor="left"
                open={open}
                onClose={toggleDrawer}
                PaperProps={{
                    sx: {
                        width: 260,
                        backgroundColor: "#202020",
                        color: "#fff",
                    },
                }}
            >
                <List sx={{ px: 2 }}>
                    {users.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No active users" />
                        </ListItem>
                    ) : (
                        users.map((user, index) => (
                            <ListItem key={index}>
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            fontSize: 12,
                                        }}
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user}`}
                                        alt={user}
                                        sizes="xs"
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={user} />
                            </ListItem>
                        ))
                    )}
                </List>
            </Drawer>
        </>
    );
}
