import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function User({ users = [], open: controlledOpen, onClose }) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined && onClose !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const handleClose = () => {
        if (isControlled) onClose();
        else setInternalOpen(false);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: 280,
                    backgroundColor: "#1a1a1a",
                    color: "#e0e0e0",
                    borderLeft: "1px solid rgba(255,255,255,0.06)",
                },
            }}
        >
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{ color: "grey.400", fontWeight: 600 }}
                >
                    Collaborators
                </Typography>
                <Typography variant="caption" sx={{ color: "grey.500" }}>
                    {users.length} {users.length === 1 ? "person" : "people"}{" "}
                    editing
                </Typography>
            </Box>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <List sx={{ py: 1, px: 1 }}>
                {users.length === 0 ? (
                    <ListItem>
                        <ListItemText
                            primary="No one else here yet"
                            primaryTypographyProps={{
                                variant: "body2",
                                color: "text.secondary",
                            }}
                        />
                    </ListItem>
                ) : (
                    users.map((user, index) => (
                        <ListItem key={index} sx={{ borderRadius: 1 }}>
                            <ListItemAvatar>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        fontSize: 14,
                                        bgcolor: "primary.dark",
                                    }}
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user}`}
                                    alt={user}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={user}
                                primaryTypographyProps={{
                                    variant: "body2",
                                    fontWeight: 500,
                                }}
                            />
                        </ListItem>
                    ))
                )}
            </List>
        </Drawer>
    );
}
